import axios, { AxiosInstance } from 'axios';
import { LiveresultatApi } from './types';
import Redis from 'ioredis';
import { jsonrepair } from 'jsonrepair';

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
    });
  }

  public getcompetitions = async () => {
    const res = await this.client.get<string>(
      `/api.php?method=getcompetitions`,
    );
    return LiveresultatAPIClient.jsonParse<LiveresultatApi.getcompetitions>(
      res.data,
    );
  };

  public getcompetitioninfo = async (id: number | string) => {
    const res = await this.client.get<string>(
      `/api.php?method=getcompetitioninfo&comp=${id}`,
    );
    return LiveresultatAPIClient.jsonParse<LiveresultatApi.getcompetitioninfo>(
      res.data,
    );
  };

  public getclasses = async (id: number) => {
    const hashKey = `liveresultat:lastHash:classes:${id}`;
    const lastHash = await this.redis.get(hashKey);
    const res = await this.client.get<string>(
      `/api.php?method=getclasses&comp=${id}&last_hash=${lastHash}`,
    );

    const data = LiveresultatAPIClient.jsonParse<
      LiveresultatApi.getclasses | { status: 'NOT MODIFIED' }
    >(res.data);

    if (data.status === 'NOT MODIFIED') {
      return null;
    }

    if (data.hash) {
      // If the data is corrupted or wrong and the hash makes it stale
      // we force a refresh by setting an expiration time
      await this.redis.set(hashKey, data.hash, 'EX', 60 * 10);
    }

    return data;
  };

  public getclassresults = async (id: number | string, className: string) => {
    const hashKey = `liveresultat:lastHash:class:${className}:results:${id}`;
    const lastHash = await this.redis.get(hashKey);
    const res = await this.client.get<string>(
      `/api.php?method=getclassresults&comp=${id}&class=${encodeURIComponent(className)}&unformattedTimes=true&last_hash=${lastHash}`,
    );

    const data = LiveresultatAPIClient.jsonParse<
      LiveresultatApi.getclassresults | { status: 'NOT MODIFIED' }
    >(res.data);

    if (data.status === 'NOT MODIFIED') {
      return null;
    }

    if (data.hash) {
      // If the data is corrupted or wrong and the hash makes it stale
      // we force a refresh by setting an expiration time
      await this.redis.set(hashKey, data.hash, 'EX', 60 * 10);
    }

    return data;
  };

  public static jsonParse = <T = object>(data: string | object): T => {
    try {
      let parsedData: T = {} as T;

      if (typeof data === 'string') {
        data = data.replace('\t', '');
        parsedData = JSON.parse(data) as T;
      } else if (typeof data === 'object') {
        parsedData = data as T;
      }

      return parsedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        const repaired = jsonrepair(data as string);
        const parseAgain = JSON.parse(repaired) as T;
        return parseAgain;
      }
      throw error;
    }
  };
}
