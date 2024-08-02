const express = require('express');
const { Telegraf } = require('telegraf');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Telegraf botini sozlash
const bot = new Telegraf('7358372482:AAFuMMugTfaRW_ddW0VhlYLOTNrDGK4Fc30');

bot.start((ctx) => ctx.reply('Welcome to the bot!'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

// Set the webhook
bot.telegram.setWebhook('https://your-server.com/secret-path');

// Parse incoming webhook updates
app.use(bodyParser.json());
app.post('/secret-path', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Express.js dastlabki yo'nalishlar
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Serverni ishga tushirish
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

bot.launch();
