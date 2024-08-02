import { Telegraf } from 'telegraf';
import { Request, Response } from 'express';

const bot = new Telegraf('7358372482:AAFuMMugTfaRW_ddW0VhlYLOTNrDGK4Fc30');

bot.start((ctx) => ctx.reply('Welcome to the bot!'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

export const setWebhook = (req: Request, res: Response) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
};

export const launchBot = () => {
    bot.launch();
    console.log('Telegram bot started');
};
