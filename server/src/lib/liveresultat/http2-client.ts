import http2 from 'http2';
import type Redis from 'ioredis';
import type { LiveresultatApi } from './types';
import { LiveresultatAPIClient } from './client';

const HOST = 'https://liveresultat.orientering.se';

let sharedClient: LiveresultatHttp2Client | null = null;

export function getHttp2Client(redis: Redis): LiveresultatHttp2Client {
  if (!sharedClient) {
    sharedClient = new LiveresultatHttp2Client(HOST, redis);
  }
  return sharedClient;
}

const REQUEST_TIMEOUT_MS = 15_000;
// Idle sessions get pinged so a silently dropped TCP connection (NAT/LB idle
// timeout, half-open socket) is detected instead of hanging the next request.
const PING_INTERVAL_MS = 30_000;
const PING_TIMEOUT_MS = 10_000;

export class LiveresultatHttp2Client {
  private session: http2.ClientHttp2Session | null = null;
  private pingTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly origin: string,
    private readonly redis: Redis,
  ) {}

  private getSession(): http2.ClientHttp2Session {
    if (this.session && !this.session.destroyed && !this.session.closed) {
      return this.session;
    }

    // Tear down any half-closed session (e.g. after GOAWAY) before replacing it
    this.close();

    const session = http2.connect(this.origin);

    const reset = () => {
      // A late 'close' from an old session must not drop a newer one
      if (this.session === session) {
        this.stopPing();
        this.session = null;
      }
    };

    // Use `on`, not `once`: a second 'error' without a listener would crash the process
    session.on('error', reset);
    session.on('close', reset);
    session.on('goaway', reset);

    this.session = session;
    this.startPing(session);
    return session;
  }

  private startPing(session: http2.ClientHttp2Session) {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (session.destroyed || session.closed) {
        return;
      }
      const timeout = setTimeout(
        () => session.destroy(new Error('HTTP/2 ping timeout')),
        PING_TIMEOUT_MS,
      );
      const sent = session.ping(err => {
        clearTimeout(timeout);
        if (err) {
          session.destroy(err);
        }
      });
      if (!sent) {
        clearTimeout(timeout);
      }
    }, PING_INTERVAL_MS);
    this.pingTimer.unref();
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private request(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let session: http2.ClientHttp2Session;
      let req: http2.ClientHttp2Stream;
      try {
        session = this.getSession();
        req = session.request({
          ':path': path,
          ':method': 'GET',
          'user-agent': 'LiveOL Server http2 client',
          accept: 'application/json',
        });
      } catch (err) {
        // e.g. ERR_HTTP2_GOAWAY_SESSION / ERR_HTTP2_INVALID_SESSION
        this.close();
        reject(err);
        return;
      }

      let settled = false;
      const settle = (err: Error | null, body?: string) => {
        if (settled) return;
        settled = true;
        if (err) reject(err);
        else resolve(body!);
      };

      // Without this a stalled stream never settles and blocks the job forever
      req.setTimeout(REQUEST_TIMEOUT_MS, () => {
        settle(new Error(`HTTP/2 request timed out: ${path}`));
        req.close(http2.constants.NGHTTP2_CANCEL);
        // A stalled stream usually means a dead connection; start fresh
        if (this.session === session) {
          this.close();
        }
      });

      let status = 0;
      req.on('response', headers => {
        status = Number(headers[':status']);
      });

      req.setEncoding('utf8');

      const chunks: string[] = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        if (status >= 400) {
          settle(new Error(`HTTP/2 ${status}: ${path}`));
        } else {
          settle(null, chunks.join(''));
        }
      });
      req.on('error', err => settle(err));
      // Streams reset with NGHTTP2_CANCEL emit 'close' without 'end' or 'error'
      req.on('close', () =>
        settle(new Error(`HTTP/2 stream closed (rst ${req.rstCode}): ${path}`)),
      );

      req.end();
    });
  }

  public async getclasses(
    id: number,
  ): Promise<LiveresultatApi.getclasses | null> {
    const hashKey = `liveresultat:lastHash:classes:${id}`;
    const lastHash = await this.redis.get(hashKey);

    const raw = await this.request(
      `/api.php?method=getclasses&comp=${id}&last_hash=${lastHash}`,
    );

    const data = LiveresultatAPIClient.jsonParse<
      LiveresultatApi.getclasses | { status: 'NOT MODIFIED' }
    >(raw);

    if (data.status === 'NOT MODIFIED') {
      return null;
    }

    const typed = data as LiveresultatApi.getclasses;
    if (typed.hash) {
      // If the data is corrupted or wrong and the hash makes it stale
      // we force a refresh by setting an expiration time
      await this.redis.set(hashKey, typed.hash, 'EX', 60 * 10);
    }

    return typed;
  }

  public async getclassresults(
    id: number,
    className: string,
  ): Promise<LiveresultatApi.getclassresults | null> {
    const hashKey = `liveresultat:lastHash:class:${className}:results:${id}`;
    const lastHash = await this.redis.get(hashKey);

    const raw = await this.request(
      `/api.php?method=getclassresults&comp=${id}&class=${encodeURIComponent(className)}&unformattedTimes=true&last_hash=${lastHash}`,
    );

    const data = LiveresultatAPIClient.jsonParse<
      LiveresultatApi.getclassresults | { status: 'NOT MODIFIED' }
    >(raw);

    if (data.status === 'NOT MODIFIED') {
      return null;
    }

    const typed = data as LiveresultatApi.getclassresults;
    if (typed.hash) {
      // If the data is corrupted or wrong and the hash makes it stale
      // we force a refresh by setting an expiration time
      await this.redis.set(hashKey, typed.hash, 'EX', 60 * 10);
    }

    return typed;
  }

  public close(): void {
    this.stopPing();
    if (this.session && !this.session.destroyed) {
      this.session.destroy();
    }
    this.session = null;
  }
}
