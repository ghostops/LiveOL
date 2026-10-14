import axios, { AxiosInstance } from 'axios';
import { LiveresultatApi } from './types';
import Redis from 'ioredis';
import {
  adaptClasses,
  adaptClassResults,
  adaptCompetitionInfo,
  classesHashKey,
  classesPath,
  classResultsHashKey,
  classResultsPath,
  fetchConditional,
  jsonParse,
  RawResponse,
} from './adapt';

export class LiveresultatAPIClient {
  private client: AxiosInstance;

  constructor(
    private root: string,
    private redis: Redis,
  ) {
    this.client = axios.create({
      headers: {
        'User-Agent': 'LiveOL Server',
      },
      baseURL: this.root,
      // Hand the adapter the raw text; it parses (and repairs) it itself
      transformResponse: r => r,
      validateStatus: s => (s >= 200 && s < 300) || s === 304,
    });
  }

  private get = async (
    path: string,
    ifNoneMatch?: string | null,
  ): Promise<RawResponse> => {
    const res = await this.client.get<string>(path, {
      headers: ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {},
    });
    return {
      status: res.status,
      etag: (res.headers['etag'] as string | undefined) ?? null,
      body: res.data,
    };
  };

  public getcompetitions = async () => {
    const res = await this.get('/competitions');
    return jsonParse<LiveresultatApi.getcompetitions>(res.body);
  };

  public getcompetitioninfo = async (id: number | string) => {
    const res = await this.get(`/competitions/${id}`);
    return adaptCompetitionInfo(res.body);
  };

  public getclasses = async (id: number) =>
    fetchConditional(
      this.redis,
      classesHashKey(id),
      etag => this.get(classesPath(id), etag),
      adaptClasses,
    );

  public getclassresults = async (id: number | string, className: string) =>
    fetchConditional(
      this.redis,
      classResultsHashKey(id, className),
      etag => this.get(classResultsPath(id, className), etag),
      res => adaptClassResults(res),
    );
}
