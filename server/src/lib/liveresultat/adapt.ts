/* eslint-disable @typescript-eslint/no-namespace */
import { jsonrepair } from 'jsonrepair';
import type Redis from 'ioredis';
import type { LiveresultatApi } from './types';

/**
 * Turns responses from the REST API (api.orienteering.services) into the
 * legacy `LiveresultatApi` shapes, so nothing downstream of the clients can
 * tell which API answered. See docs/liveresultat-new-api-migration.md.
 */

export const LiveresultatApiUrl = 'https://api.orienteering.services';

/**
 * A row is flagged `new_result` when its `changed` timestamp is at most this
 * old. It must be at least the poll interval of the sync jobs (stored in
 * `scheduled_jobs`, at most once a minute), or a change landing between two
 * polls is never flagged. The slack covers job runtime and clock skew with
 * upstream; a too-large window only makes the highlight last a little longer.
 */
export const NEW_RESULT_WINDOW_SECONDS = 180;

export declare namespace LiveresultatRestApi {
  export interface classes {
    classes: string[];
  }

  export interface classresults {
    className: string;
    splitControls: LiveresultatApi.split[];
    results: result[];
    isMultiDay?: boolean;
    isMassStart?: boolean;
    qualificationLimits?: unknown[];
  }

  export interface result
    extends Omit<LiveresultatApi.result, 'DT_RowClass' | 'splits'> {
    bib?: string;
    /** Unix seconds */
    changed?: number;
    startChanged?: number;
    splits?: Record<string, number>;
  }
}

export const jsonParse = <T = object>(data: string | object): T => {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data.replace('\t', '')) as T;
    }
    return data as T;
  } catch (error) {
    // Only runs on a parse error, so it costs nothing on a healthy response
    if (error instanceof SyntaxError) {
      return JSON.parse(jsonrepair(data as string)) as T;
    }
    throw error;
  }
};

/** What either HTTP client hands the adapter. */
export interface RawResponse {
  status: number;
  etag: string | null;
  body: string;
}

export const adaptCompetitionInfo = (
  body: string | object,
): LiveresultatApi.getcompetitioninfo =>
  jsonParse<LiveresultatApi.getcompetitioninfo>(body);

export const adaptClasses = (
  res: RawResponse,
): LiveresultatApi.getclasses | null => {
  if (res.status === 304) return null;

  const data = jsonParse<LiveresultatRestApi.classes>(res.body);

  return {
    status: 'OK',
    hash: res.etag ?? '',
    classes: (data.classes ?? []).map(className => ({ className })),
  };
};

export const adaptClassResults = (
  res: RawResponse,
  now: number = Date.now(),
): LiveresultatApi.getclassresults | null => {
  if (res.status === 304) return null;

  const data = jsonParse<LiveresultatRestApi.classresults>(res.body);

  const nowSeconds = now / 1000;

  return {
    status: 'OK',
    hash: res.etag ?? '',
    className: data.className,
    splitcontrols: data.splitControls ?? [],
    results: (data.results ?? []).map(row => {
      // Pull out the fields legacy never sent; everything else passes through
      const { changed, splits, ...rest } = row;

      // Legacy omits `splits` for rows without any, so keep it absent too
      const result = {
        ...rest,
        ...(splits && { splits: stripChangedSplits(splits) }),
      } as LiveresultatApi.result;

      if (
        typeof changed === 'number' &&
        nowSeconds - changed <= NEW_RESULT_WINDOW_SECONDS
      ) {
        result.DT_RowClass = 'new_result';
      }

      return result;
    }),
  };
};

/** `insertSplitResults` would read a `<code>_changed` key as a split time. */
const stripChangedSplits = (
  splits: Record<string, number>,
): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(splits)) {
    if (!key.endsWith('_changed')) out[key] = value;
  }
  return out;
};

/**
 * The ETag lives in the key the legacy `last_hash` used, so `/v2` keeps
 * returning it as `hash` and the app keeps vibrating when it changes. The
 * expiry forces a refresh if the stored value is ever stale or corrupt.
 */
export const fetchConditional = async <T extends LiveresultatApi.hashed>(
  redis: Redis,
  hashKey: string,
  fetch: (ifNoneMatch: string | null) => Promise<RawResponse>,
  adapt: (res: RawResponse) => T | null,
): Promise<T | null> => {
  const etag = await redis.get(hashKey);
  const data = adapt(await fetch(etag));

  if (data?.hash) {
    await redis.set(hashKey, data.hash, 'EX', 60 * 10);
  }

  return data;
};

export const classesPath = (id: number | string) =>
  `/competitions/${id}/classes`;

/** Always the query form: class names can contain `/` (`K20/21`). */
export const classResultsPath = (id: number | string, className: string) =>
  `/competitions/${id}/classresults?class=${encodeURIComponent(className)}`;

export const classesHashKey = (id: number | string) =>
  `liveresultat:lastHash:classes:${id}`;

export const classResultsHashKey = (id: number | string, className: string) =>
  `liveresultat:lastHash:class:${className}:results:${id}`;
