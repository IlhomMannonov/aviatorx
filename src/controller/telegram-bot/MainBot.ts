import { Telegraf, Markup } from 'telegraf';
import { Request, Response } from 'express';

const bot = new Telegraf('7358372482:AAFuMMugTfaRW_ddW0VhlYLOTNrDGK4Fc30');

// Start buyruqiga tugmalar qo'shish
bot.start((ctx) =>
    ctx.reply(
        'Assalomu Alaykum Botga hush kelibsiz',
        Markup.keyboard([['Option 1', 'Option 2'], ['Option 3']])
            .resize()
    )
);

bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

// Tugmalar bosilganda javob berish
bot.hears('Option 1', (ctx) => ctx.reply('You selected Option 1'));
bot.hears('Option 2', (ctx) => ctx.reply('You selected Option 2'));
bot.hears('Option 3', (ctx) => ctx.reply('You selected Option 3'));

// Inline web app tugmasi qo'shish
bot.command('webapp', (ctx) =>
    ctx.reply(
        'Web App Tugmasi:',
        Markup.inlineKeyboard([
            Markup.button.webApp('Open Web App', 'https://sportsodds.vercel.app/')
        ])
    )
);

export const setWebhook = (req: Request, res: Response) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
};

export const launchBot = () => {
    bot.launch();
    console.log('Telegram bot started');
};
