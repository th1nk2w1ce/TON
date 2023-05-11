require('dotenv').config();

import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as os from 'os';
import { TonConnectProvider } from './provider';
import { initRedisClient } from './tonconnect/storage';
import { initRedisClient2, UserStorage } from './storage';
import { toFile } from 'qrcode';
import { getConnector } from './tonconnect/connector';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const channelId = process.env.CHANNEL_ID!;
const bot = new TelegramBot(token, { polling: true });

async function welcomeUser(chatId: number) {
    await bot.sendMessage(chatId, 'Welcome!', {
        reply_markup: {
            keyboard: [[{ text: 'Profile' }]],
            resize_keyboard: true,
        },
    });
}

async function initializeUser(user: UserStorage) {
    if (!(await user.initialized)) {
        user.initialized = (async () => true)();
        if ((await user.referer) != 0) {
            const referer = new UserStorage(await user.referer);
            referer.referrals = (async () => (await referer.referrals) + 1)();
        }
    }
}

function referralsToReward(referrals: number) {
    return referrals * 3;
}

async function main(): Promise<void> {
    await initRedisClient();
    await initRedisClient2();

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const user = new UserStorage(chatId);

        const provider = new TonConnectProvider(getConnector(chatId), 'Tonkeeper');
        await provider.restoreConnection();

        if (!provider.address()) {
            const msg1 = await bot.sendMessage(chatId, 'Connect your Tonkeeper wallet');
            const url = await provider.getConnectUrl();
            const filename = os.tmpdir() + 'qrcode' + Math.floor(Math.random() * 1e6).toString() + '.png';
            toFile(filename, url, async () => {
                const msg = await bot.sendPhoto(chatId, filename, { caption: 'Scan this QR code with Tonkeeper' });
                await fs.promises.rm(filename);
                await provider.connect(async () => {
                    await bot.deleteMessage(chatId, msg1.message_id);
                    await bot.deleteMessage(chatId, msg.message_id);

                    const member = await bot.getChatMember(channelId, chatId);

                    if (member.status == 'kicked' || member.status == 'left') {
                        await bot.sendMessage(chatId, 'Subscribe to channel: t.me/+cy-IdVPqMcVhZDQy', {
                            reply_markup: {
                                inline_keyboard: [[{ text: 'Subscribed!', callback_data: 'subscribed' }]],
                            },
                        });
                    } else {
                        await welcomeUser(chatId);
                    }
                });
            });
            return;
        }

        const member = await bot.getChatMember(channelId, chatId);

        if (member.status == 'kicked' || member.status == 'left') {
            await bot.sendMessage(chatId, 'Subscribe to channel: t.me/+cy-IdVPqMcVhZDQy', {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Subscribed!', callback_data: 'subscribed' }]],
                },
            });
            return;
        }

        await initializeUser(user);

        if (msg.text == 'Profile') {
            const referrals = await user.referrals;

            await bot.sendMessage(
                chatId,
                `Your personal invite link: t.me/testqwe12312321bot?start=${chatId}
Already invited: ${referrals}
Your reward: ${referralsToReward(referrals)} tokens`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Share invite link',
                                    switch_inline_query: `I invite you to t.me/testqwe12312321bot?start=${chatId}`,
                                },
                            ],
                        ],
                    },
                }
            );
        } else {
            await welcomeUser(chatId);
        }
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.from.id;

        if (query.data == 'subscribed') {
            const member = await bot.getChatMember(channelId, chatId);

            if (member.status == 'kicked' || member.status == 'left') {
                await bot.answerCallbackQuery(query.id, {
                    text: 'Not subscribed!',
                });
                return;
            }

            await initializeUser(new UserStorage(chatId));
            await bot.answerCallbackQuery(query.id);
            await bot.deleteMessage(chatId, query.message!.message_id);
            await welcomeUser(chatId);
        }
    });

    bot.onText(/^\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const user = new UserStorage(chatId);

        const param = msg.text!.slice(7);
        const referer = new UserStorage(parseInt(param));
        if (await referer.initialized) {
            if ((await user.referer) === 0) {
                user.referer = (async () => parseInt(param))();
            }
        }
    });
}

main();
