import http from 'http';
import http2 from 'http2';
import { AddressInfo } from 'net';

export type LegacyHandler = (
  query: URLSearchParams,
) => { status?: number; body: string } | string;

/**
 * A stand-in for liveresultat.orientering.se/api.php, so the real client runs
 * over real HTTP against recorded responses. Nothing is mocked inside the
 * client itself — hash handling, jsonParse and URL construction all execute.
 */
export const startLegacyServer = async (handler: LegacyHandler) => {
  const requests: string[] = [];

  const server = http.createServer((req, res) => {
    requests.push(req.url ?? '');
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname !== '/api.php') {
      res.writeHead(404).end('not found');
      return;
    }
    const out = handler(url.searchParams);
    const { status = 200, body } =
      typeof out === 'string' ? { body: out } : out;
    res.writeHead(status, { 'content-type': 'application/json' }).end(body);
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    /** Every path the client asked for, in order — lets tests assert query shape. */
    requests,
    close: () => new Promise<void>(resolve => server.close(() => resolve())),
  };
};

/**
 * The same, over cleartext HTTP/2, for `LiveresultatHttp2Client`. `onSession`
 * can destroy or GOAWAY a session to exercise the reconnect paths that commit
 * 9ec25e3 added after a production hang.
 */
export const startLegacyHttp2Server = async (
  handler: LegacyHandler,
  onSession?: (session: http2.ServerHttp2Session) => void,
) => {
  const requests: string[] = [];
  const server = http2.createServer();

  if (onSession) server.on('session', onSession);

  server.on('stream', (stream, headers) => {
    const rawPath = String(headers[':path'] ?? '/');
    requests.push(rawPath);
    const url = new URL(rawPath, 'http://localhost');
    if (url.pathname !== '/api.php') {
      stream.respond({ ':status': 404 });
      stream.end('not found');
      return;
    }
    const out = handler(url.searchParams);
    const { status = 200, body } =
      typeof out === 'string' ? { body: out } : out;
    stream.respond({ ':status': status, 'content-type': 'application/json' });
    stream.end(body);
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () =>
      new Promise<void>(resolve => {
        server.close(() => resolve());
      }),
  };
};
