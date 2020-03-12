import { AsyncStorage } from 'react-native';

interface SavedObject<T> {
    data: T;
    ttl: number;
}

const TURNED_ON = true;
const PREFIX = 'CACHE:';

export class Cache<T> {
    public key: string;
    public expiry: number = 3600;

    constructor(key: string, expiry?: number) {
        this.key = PREFIX + key;

        if (expiry) {
            this.expiry = __DEV__ ? 999 : expiry;
        }
    }

    public async set(data: T): Promise<void> {
        const save: SavedObject<T> = {
            data,
            ttl: Date.now() + this.expiry,
        };

        return await AsyncStorage.setItem(this.key, JSON.stringify(save));
    }

    public async get(): Promise<T> {
        if (!TURNED_ON) return null;

        const data = await AsyncStorage.getItem(this.key) || null;
        const parsed: SavedObject<T> = JSON.parse(data);

        if (
            !parsed ||
            !parsed.ttl ||
            !parsed.data ||
            Date.now() >= parsed.ttl
        ) {
            await this.purge();
            return null;
        }

        return parsed.data;
    }

    public async purge(): Promise<void> {
        return await AsyncStorage.removeItem(this.key);
    }
}
