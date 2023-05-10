require('dotenv').config();

import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as os from 'os';
import { TonConnectProvider } from './provider';
import { initRedisClient, TonConnectStorage } from './tonconnect/storage';
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

    if (member.status != 'kicked' && member.status != 'left') {
        callback();
    } else {
        await bot.sendMessage(chatId, 'Subscribe to channel: t.me/qweweqwewqeqwewqewq', {
            reply_markup: {
                inline_keyboard: [[{ text: 'Subscribed!', callback_data: 'subscribed' }]],
            },
        });
    }
}

async function welcomeUser(chatId: number) {
    let userStorage = new TonConnectStorage(chatId);
    if (userStorage.getItem('referrals') === null) {
        await userStorage.setItem('referrals', '0');
    }
    await bot.sendMessage(chatId, 'Welcome!', {
        reply_markup: {
            keyboard: [[{ text: 'Profile' }]],
            resize_keyboard: false,
        },
    });
}

function referralsToReward(referrals: number) {
    return referrals * 3;
}

async function main(): Promise<void> {
    await initRedisClient();

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;

        await ensureTonconnect(chatId, async () => {
            await ensureSubscription(chatId, async () => {
                let userStorage = new TonConnectStorage(chatId);
                const referrals = await userStorage.getItem('referrals');

                if (msg.text == 'Profile') {
                    await bot.sendMessage(
                        chatId,
                        `Your personal invite link: t.me/testqwe12312321bot?start=${chatId}
Already invited: ${referrals}
Your reward: ${referralsToReward(parseInt(referrals!))} tokens`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Share invite link', switch_inline_query: 'qweqweqwe test' }],
                                ],
                            },
                        }
                    );
                }
            });
        });
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.from.id;

        if (query.data == 'subscribed') {
            ensureSubscription(chatId, async () => {
                await bot.answerCallbackQuery(query.id);
                await bot.deleteMessage(chatId, query.message!.message_id);
                await welcomeUser(chatId);
            });
        }
    });

    bot.onText(/^\/start/, async (msg) => {
        const chatId = msg.chat.id;
        await welcomeUser(chatId);

        const param = msg.text!.slice(7);
        let refererStorage = new TonConnectStorage(parseInt(param));
        if ((await refererStorage.getItem('referrals')) !== null) {
            let userStorage = new TonConnectStorage(chatId);
            const savedParam = await userStorage.getItem('referer');
            if (savedParam === null) {
                await userStorage.setItem('referer', param);
            }
        }
    });
}

main();
