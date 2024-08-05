import {Markup, Telegraf} from 'telegraf';
import {Request, Response} from 'express';
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/db";
import {Context} from "node:vm";
import {Wallet} from "../../entity/Wallet";
import {Currency} from "../../entity/Currency";

const bot = new Telegraf('7358372482:AAFuMMugTfaRW_ddW0VhlYLOTNrDGK4Fc30');
const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);
const currencyRepository = AppDataSource.getRepository(Currency);

// Start buyruqiga tugmalar qo'shish
bot.start(async (ctx) => {
        ctx.reply(
            'Assalomu Alaykum Iltimos telefon raqamingizni yuboring',
            Markup.keyboard([
                Markup.button.contactRequest("📞 Telefon raqamni jo'narish")
            ])
                .resize()
        );

        await getBotUser(ctx.chat.id.toString());
    }
);

bot.on('contact', async (ctx) => {
    const user = await getBotUser(ctx.chat.id.toString());
    // if (user.state == 'send_phone') {
    user.state = "send_FIO";
    await userRepository.save(user);

    const contact = ctx.message.contact;
    let number = contact.phone_number;
    if (!contact.phone_number.startsWith('+')) {
        number = '+' + contact.phone_number;
    }
    ctx.reply("To'liq ism familyangizni yuboring", Markup.removeKeyboard());
    // }
});

bot.on('text', async (ctx) => {
    const user = await getBotUser(ctx.chat.id.toString());
    if (user.state === 'send_FIO') {
        const text = ctx.message.text.trim();
        const parts = text.split(' ');

        if (parts.length === 2 && parts[0].length > 3 && parts[1].length > 3) {
            const firstName = parts[0];
            const lastName = parts[1];


            user.first_name = firstName;
            user.last_name = lastName;
            await userRepository.save(user);
            // Tekshiruv muvaffaqiyatli
            await userHome(ctx);
            // Yangi holatga o'tkazish yoki boshqa amallarni bajarish
            await updateUserState(ctx.chat.id.toString(), 'user_home');
        } else {
            // Tekshiruv muvaffaqiyatsiz
            ctx.reply('Iltimos, ismingiz va familiyangizni to\'g\'ri kiriting. Ikkalasi ham kamida 3 harfdan iborat bo\'lishi kerak.');
        }
    }
});

export const setWebhook = (req: Request, res: Response) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
};

export const launchBot = () => {
    bot.launch();
    console.log('Telegram bot started');
};

export const userHome = async (ctx: Context) => {
    const user = await getBotUser(ctx.chat?.id.toString());

    await ctx.reply(
        "Barcha O'yinlar ro'yxati",
        Markup.inlineKeyboard([
            [Markup.button.webApp("✈️ Aviator ✈️", 'https://script.viserlab.com')]
        ])
    );
};

export const updateUserState = async (chat_id: string, state: string): Promise<User> => {
    const user = await getBotUser(chat_id);
    user.state = state;
    await userRepository.save(user);
    return user;
};

export const getBotUser = async (chat_id: string): Promise<User> => {
    const findUser = await userRepository.findOne({where: {chat_id}});
    if (!findUser) {
        const newUser = userRepository.create({
            chat_id,
            is_bot_user: true,
            state: 'send_phone'
        });
        // Yaratilgan foydalanuvchini saqlash
        await userRepository.save(newUser);

        const currency = await currencyRepository.findOne({where: {code: 'UZS'}})
        const wallet = walletRepository.create({
            amount: 0.0,
            user_id: newUser.id,
            currency_id: currency?.id,
            name: ""
        });

        await walletRepository.save(wallet);


        return newUser;
    }
    return findUser;
};