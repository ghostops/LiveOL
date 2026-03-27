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

export class LiveresultatHttp2Client {
  private session: http2.ClientHttp2Session | null = null;

  constructor(
    private readonly origin: string,
    private readonly redis: Redis,
  ) {}

  private getSession(): http2.ClientHttp2Session {
    if (this.session && !this.session.destroyed && !this.session.closed) {
      return this.session;
    }

    const session = http2.connect(this.origin);

    const reset = () => {
      this.session = null;
      // Also clear the module-level singleton so the next call gets a fresh client
      if (sharedClient === this) {
        sharedClient = null;
      }
    };

    session.once('error', reset);
    session.once('close', reset);

    this.session = session;
    return session;
  }

  private request(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let session: http2.ClientHttp2Session;
      try {
        session = this.getSession();
      } catch (err) {
        reject(err);
        return;
      }

      const req = session.request({
        ':path': path,
        ':method': 'GET',
        'user-agent': 'LiveOL Server http2 client',
        accept: 'application/json',
      });

      req.setEncoding('utf8');

      const chunks: string[] = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(chunks.join('')));
      req.on('error', reject);

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
    if (this.session && !this.session.destroyed) {
      this.session.destroy();
    }
    this.session = null;
  }
}
