import crypto from 'crypto';
import http from 'http';
import http2 from 'http2';
import { AddressInfo } from 'net';
import { raw } from './fixtures';

export type RestReply = { status?: number; body?: string; etag?: string };

export type RestHandler = (
  url: URL,
  ifNoneMatch: string | undefined,
) => RestReply | string;

const etagOf = (body: string) =>
  `"${crypto.createHash('md5').update(body).digest('hex')}"`;

/**
 * Serves `tests/fixtures/new/` the way api.orienteering.services does: path
 * routing, `?class=` for class results, an ETag on every body, and 304 when
 * `If-None-Match` matches. `classResults` picks the fixture per class name.
 */
export const fixtureRestHandler =
  (
    classResults: (className: string) => string = className =>
      className === 'NoSuchClass'
        ? raw('new/classresults.unknownclass.json')
        : raw('new/classresults.json'),
  ): RestHandler =>
  (url, ifNoneMatch) => {
    let body: string | null = null;

    if (url.pathname === '/competitions') {
      body = '{"competitions":[]}';
    } else if (url.pathname.match(/^\/competitions\/\d+$/)) {
      body = raw('new/competition.json');
    } else if (url.pathname.match(/^\/competitions\/\d+\/classes$/)) {
      body = raw('new/classes.json');
    } else if (url.pathname.match(/^\/competitions\/\d+\/classresults$/)) {
      body = classResults(url.searchParams.get('class') ?? '');
    }

    if (body === null) return { status: 404, body: 'not found' };

    const etag = etagOf(body);
    if (ifNoneMatch === etag) return { status: 304, etag };
    return { body, etag };
  };

const normalise = (out: RestReply | string): Required<RestReply> => {
  const r = typeof out === 'string' ? { body: out } : out;
  return { status: r.status ?? 200, body: r.body ?? '', etag: r.etag ?? '' };
};

/**
 * A stand-in for api.orienteering.services, so the real client runs over real
 * HTTP against recorded responses. Nothing is mocked inside the client itself
 * — ETag handling, jsonParse and URL construction all execute.
 */
export const startRestServer = async (handler: RestHandler) => {
  const requests: { path: string; ifNoneMatch?: string }[] = [];

  const server = http.createServer((req, res) => {
    const ifNoneMatch = req.headers['if-none-match'];
    requests.push({ path: req.url ?? '', ifNoneMatch });
    const url = new URL(req.url ?? '/', 'http://localhost');
    const { status, body, etag } = normalise(handler(url, ifNoneMatch));
    res
      .writeHead(status, {
        'content-type': 'application/json',
        ...(etag && { etag }),
      })
      .end(status === 304 ? undefined : body);
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    /** Every request the client made, in order. */
    requests,
    close: () => new Promise<void>(resolve => server.close(() => resolve())),
  };
};

/**
 * The same, over cleartext HTTP/2, for `LiveresultatHttp2Client`. `onSession`
 * can destroy or GOAWAY a session to exercise the reconnect paths that commit
 * 9ec25e3 added after a production hang.
 */
export const startRestHttp2Server = async (
  handler: RestHandler,
  onSession?: (session: http2.ServerHttp2Session) => void,
) => {
  const requests: { path: string; ifNoneMatch?: string }[] = [];
  const server = http2.createServer();

  if (onSession) server.on('session', onSession);

  server.on('stream', (stream, headers) => {
    const rawPath = String(headers[':path'] ?? '/');
    const ifNoneMatch = headers['if-none-match'] as string | undefined;
    requests.push({ path: rawPath, ifNoneMatch });
    const url = new URL(rawPath, 'http://localhost');
    const { status, body, etag } = normalise(handler(url, ifNoneMatch));
    stream.respond({
      ':status': status,
      'content-type': 'application/json',
      ...(etag && { etag }),
    });
    stream.end(status === 304 ? undefined : body);
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
