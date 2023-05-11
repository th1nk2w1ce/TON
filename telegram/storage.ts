require('dotenv').config();

import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.log('Redis Client Error', err));

export async function initRedisClient2(): Promise<void> {
    await client.connect();
}

export class UserStorage {
    constructor(private readonly chatId: number) {}

    private getKey(key: string): string {
        return this.chatId.toString() + key;
    }

    private async removeItem(key: string): Promise<void> {
        await client.del(this.getKey(key));
    }

    private async setItem(key: string, value: string): Promise<void> {
        await client.set(this.getKey(key), value);
    }

    private async getItem(key: string): Promise<string | null> {
        return (await client.get(this.getKey(key))) || null;
    }

    get referrals(): Promise<number> {
        return (async () => {
            return parseInt((await this.getItem('referrals')) || '0');
        })();
    }

    get referer(): Promise<number> {
        return (async () => {
            return parseInt((await this.getItem('referer')) || '0');
        })();
    }

    get initialized(): Promise<boolean> {
        return (async () => {
            return (await this.getItem('initialized')) !== null;
        })();
    }

    set referrals(value: Promise<number>) {
        (async () => {
            await this.setItem('referrals', (await value).toString());
        })();
    }

    set referer(value: Promise<number>) {
        (async () => {
            await this.setItem('referer', (await value).toString());
        })();
    }

    set initialized(value: Promise<boolean>) {
        (async () => {
            if (await value) await this.setItem('initialized', '1');
            else await this.removeItem('initialized');
        })();
    }
}
