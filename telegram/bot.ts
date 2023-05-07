require('dotenv').config();

import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as os from 'os';
import { TonConnectProvider } from './provider';
import { initRedisClient } from './tonconnect/storage';
import { toFile } from 'qrcode';
import { getConnector } from './tonconnect/connector';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const channelId = process.env.CHANNEL_ID!;
const bot = new TelegramBot(token, { polling: true });

async function ensureTonconnect(chatId: number, callback: Function) {
    const provider = new TonConnectProvider(getConnector(chatId), 'Tonkeeper');
    await provider.restoreConnection();

    if (provider.address()) {
        callback();
        return;
    }

    await bot.sendMessage(chatId, 'Connect your Tonkeeper wallet');
    const url = await provider.getConnectUrl();
    const filename = os.tmpdir() + 'qrcode' + Math.floor(Math.random() * 1e6).toString() + '.png';
    toFile(filename, url, async () => {
        const msg = await bot.sendPhoto(chatId, filename, { caption: 'Scan this QR code with Tonkeeper' });
        await fs.promises.rm(filename);
        await provider.connect(callback);
    });
}

async function ensureSubscription(chatId: number, callback: Function) {
    const member = await bot.getChatMember(channelId, chatId);

    if (member.is_member == true) {
        callback();
    } else {
        await bot.sendMessage(chatId, 'Subscribe to channel: @testtesttest');
    }
}

async function main(): Promise<void> {
    await initRedisClient();

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;

        await ensureTonconnect(chatId, async () => {
            ensureSubscription(chatId, async () => {
                await bot.sendMessage(chatId, 'Hello!');
            });
        });
    });
}

main();
