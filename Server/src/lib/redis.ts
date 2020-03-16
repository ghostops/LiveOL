import * as Redis from 'ioredis';

export interface CacheOptions {
    ttl?: number;
    expire?: boolean;
}

export class Cacher {
    public client: Redis.Redis;
    public options: CacheOptions;

    public init(config: Redis.RedisOptions, cacheOptions: CacheOptions = { ttl: 5, expire: true }) {
        this.client = new Redis(config);
        this.options = cacheOptions;
    }

    public async get(keyName: string): Promise<any> {
        try {
            const val = await this.client.get(keyName);
            return val ? JSON.parse(val) : null;
        } catch {
            console.warn({
                message: 'getting cache failed',
                keyName,
            });
            return null;
        }
    };

    public async set(
        keyName: string, value: any, { ttlMs }: { ttlMs?: number } = { ttlMs: 0 },
    ): Promise<any> {
        try {
            await this.client.set(keyName, JSON.stringify(value));

            if (this.options.expire || ttlMs) {
                await this.client.expire(keyName, (ttlMs / 1000) || this.options.ttl);
            }

            return value;
        } catch {
            console.warn({ keyName, value, message: 'setting cache failed' });
            return null;
        }
    }

    public async del(keyName: string): Promise<any> {
        try {
            return this.client.del(keyName);
        } catch {
            console.warn({ keyName, message: 'delete cache failed' });
            return null;
        }
    }
}

export const Cache = new Cacher();
