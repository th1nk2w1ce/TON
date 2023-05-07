require('dotenv').config();

import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as os from 'os';
import { TonConnectProvider } from './provider';
import { initRedisClient } from './tonconnect/storage';
import { toFile } from 'qrcode';
import { getConnector } from './tonconnect/connector';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

async function main(): Promise<void> {
    await initRedisClient();

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, 'Hello!');
    });
}

main();
