import Redis, { RedisOptions } from 'ioredis';

export class Cacher {
	public client: Redis;

	constructor(config: RedisOptions) {
		this.client = new Redis(config);
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
	}

	public async set(keyName: string, value: any, { ttlMs }: { ttlMs?: number } = { ttlMs: undefined }): Promise<any> {
		try {
			await this.client.set(keyName, JSON.stringify(value));

			if (ttlMs) {
				await this.client.expire(keyName, ttlMs / 1000);
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
