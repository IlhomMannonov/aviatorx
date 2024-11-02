import {Markup, Telegraf} from 'telegraf';
import {Request, Response} from 'express';
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/db";
import {Context} from "node:vm";
import {Wallet} from "../../entity/Wallet";
import {Currency} from "../../entity/Currency";
import {Payme} from "../../entity/paymentBot/Payme";
import {Game} from "../../entity/Game";
import {PaymentMethod} from "../../entity/PaymentMethod";
import {PaymentType} from "../../entity/enums/PaymentType";

const bot = new Telegraf('8195373493:AAGTqQ4j6wsKHC--pR7yREANBbWWXUfgEmE');
const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);
const currencyRepository = AppDataSource.getRepository(Currency);
const paymeRepository = AppDataSource.getRepository(Payme);
const gameRepository = AppDataSource.getRepository(Game);
const paymentTypesRepository = AppDataSource.getRepository(PaymentMethod);

const bks: { [key: string]: string } = {
    'telegram_aviator': 'Telegram Aviator UZS',
    'mostbet': 'Mostbet',
    '1xbet': '1Xbet',
    'back:payme-home': '🔚Ortga'
};


// Start buyruqiga tugmalar qo'shish
bot.start(async (ctx) => {
        const user = await getBotUser(ctx.chat.id.toString());
        if (!user.last_name) {

            await ctx.reply(
                'Assalomu Alaykum Iltimos telefon raqamingizni yuboring',
                Markup.keyboard([
                    Markup.button.contactRequest("📞 Telefon raqamni jo'narish")
                ])
                    .resize()
            );
        } else {
            await userHome(ctx);
        }

        // await getBotUser(ctx.chat.id.toString());
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
            // await userHome(ctx);
            // Yangi holatga o'tkazish yoki boshqa amallarni bajarish
            await updateUserState(ctx.chat.id.toString(), 'choise_currency');
            const currency = await currencyRepository.find({where: {status: 'active'}});

            const buttons = currency.map((item) => Markup.button.callback(item.name, `currency_${item.name}`));

            const keyboard = Markup.inlineKeyboard(buttons, {columns: 2}); // Adjust columns as needed (e.g., 2 for two buttons per row)

            ctx.reply("Pul birligini tanlang👇", keyboard)

        } else {
            // Tekshiruv muvaffaqiyatsiz
            ctx.reply('Iltimos, ismingiz va familiyangizni to\'g\'ri kiriting. Ikkalasi ham kamida 3 harfdan iborat bo\'lishi kerak.');
        }
    } else if (user.state == 'choise_currency') {

        const currency = await currencyRepository.find({where: {status: 'active'}});

        const buttons = currency.map((item) => Markup.button.callback(item.name, `currency_${item.name}`));

        const keyboard = Markup.inlineKeyboard(buttons, {columns: 2}); // Adjust columns as needed (e.g., 2 for two buttons per row)

        ctx.reply("Pul birligini tanlang👇", keyboard)
    }
});

bot.action(["currency_UZS", "currency_USD", "currency_RUB"], async (ctx) => {
    if (ctx.chat != null) {
        // Foydalanuvchini olish
        const user = await getBotUser(ctx.chat.id.toString());

        // Valyutani aniqlash (callback_data orqali)
        const currencyCode = ctx.match[0].split('_')[1];
        const currency = await currencyRepository.findOne({where: {name: currencyCode}});
        // Hamyonni qidirish
        const foundWallet = await walletRepository.exists({where: {user_id: user.id, currency_id: currency?.id}});

        // Agar hamyon mavjud bo'lmasa, yangi hamyon yaratish
        if (!foundWallet) {
            const wallet = walletRepository.create({
                amount: 0.0,
                user_id: user.id,
                is_current: true,
                currency_id: currency?.id,
                name: `${currencyCode.toUpperCase()} Wallet`,
                is_demo: false
            });
            await walletRepository.save(wallet); // Saqlash uchun `await` qo'shildi
            const demoWallet = walletRepository.create({
                amount: 0.0,
                user_id: user.id,
                currency_id: currency?.id,
                name: `demo Wallet`,
                is_demo: true
            });
            await walletRepository.save(demoWallet); // Saqlash uchun `await` qo'shildi
        }


        userHome(ctx);
    }
});


bot.action("games", async (ctx) => {
    if (ctx.chat != null) {
        // Faol o'yinlarni olish
        const activeGames = await gameRepository.find({
            order: {id: "ASC"},
            where: {deleted: false, status: "active"},
        });
        const user = await getBotUser(ctx.chat.id.toString());

        if (user && activeGames.length > 0) {
            // O'yinlar uchun webApp tugmalarini yaratish
            const gameButtons = activeGames.map((game) => [
                Markup.button.webApp(game.name, `${game.url}?user_id=${user.id}`)
            ]);

            // "Ortga 🔙" tugmasini alohida klaviatura qatoriga joylash
            const backButton = [Markup.button.callback("Ortga 🔙", "go_home")];

            // O'yinlar ro'yxatini va "Ortga" tugmasini birlashtirish
            await ctx.editMessageText(
                "Barcha O'yinlar 👇",
                Markup.inlineKeyboard([...gameButtons, backButton])
            );
        } else {
            // Hech qanday o'yin mavjud bo'lmasa
            await ctx.reply("Hozircha hech qanday o'yin mavjud emas.");
        }
    }
});

bot.action("deposit", async (ctx) => {
    if (ctx.chat != null) {
        const user = await getBotUser(ctx.chat.id.toString());

        const paymentMethod = await paymentTypesRepository.find({
            where: {status: 'active', deleted: false, type: PaymentType.IN},
            order: {id: "ASC"}
        })
        if (user && paymentMethod.length > 0) {

            const paymentMethodButtons = paymentMethod.map((p) => [
                Markup.button.url(`${p.name}: ${p_n(p.min)} ➡️ ${p_n(p.max)}`, `${p.url}`)

            ])
            const backButton = [Markup.button.callback("Ortga 🔙", "go_home")];
            await ctx.editMessageText(
                "To'ldirmoqchi bo'lgan to'lov turingizni tanlang 👇",
                Markup.inlineKeyboard([...paymentMethodButtons, backButton])
            );
        } else {
            await ctx.reply("Hozircha Tolov turlari mavjud emas tez orada paydo bo'ladi");
        }
    }
})

function p_n(number: number) {
    const wholeNumber = Math.trunc(number); // Kasr qismini olib tashlaydi
    return new Intl.NumberFormat('en-US').format(wholeNumber); // Minglik ajratgich bilan formatlaydi
}

bot.action("go_home", async (ctx) => {
    await userHome(ctx, true)
})


export const setWebhook = (req: Request, res: Response) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
};

export const launchBot = () => {
    bot.launch();
    console.log('Telegram bot started');
};

export const userHome = async (ctx: Context, is_update: boolean = false) => {
    const user = await getBotUser(ctx.chat?.id.toString());
    if (!is_update) {
        await ctx.reply(
            "🎉 TxBet - Eng yaxshi bukmekerlik imkoniyatlari bilan qo‘lga kiriting! 🏆\n" +
            "\n" +
            "📲 O‘yinlar va musobaqalarni kuzating, statistikalarni o‘rganing va omadni sinab ko‘ring! 💸 ❓ Savollar yoki yordam kerakmi? Biz doimo yordamingizdamiz!\n" +
            "\n" +
            "👇 Boshlash uchun tugmalarni tanlang!",
            Markup.inlineKeyboard([
                [Markup.button.webApp("O'yinlar", `${process.env.WEB_URL}/game_list?user_id=${user.id}`), Markup.button.webApp("Mablag' solish", `${process.env.WEB_URL}/payment_methods`)],
                [Markup.button.webApp("Mablag' chiqarish", `${process.env.WEB_URL}/withdraw?user_id=${user.id}`), Markup.button.webApp("To'lovlar", `${process.env.WEB_URL}/transactions?user_id=${user.id}`),],
            ])
        );
        await ctx.reply("Uy Bo'limi", Markup.removeKeyboard())
    } else {
        await ctx.editMessageText(
            "🎉 TxBet - Eng yaxshi bukmekerlik imkoniyatlari bilan qo‘lga kiriting! 🏆\n" +
            "\n" +
            "📲 O‘yinlar va musobaqalarni kuzating, statistikalarni o‘rganing va omadni sinab ko‘ring! 💸 ❓ Savollar yoki yordam kerakmi? Biz doimo yordamingizdamiz!\n" +
            "\n" +
            "👇 Boshlash uchun tugmalarni tanlang!",
            Markup.inlineKeyboard([
                [Markup.button.webApp("O'yinlar", `${process.env.WEB_URL}/game_list?user_id=${user.id}`), Markup.button.webApp("Mablag' solish", `${process.env.WEB_URL}/payment_methods`)],
                [Markup.button.webApp("Mablag' chiqarish", `${process.env.WEB_URL}/withdraw?user_id=${user.id}`), Markup.button.webApp("To'lovlar", `${process.env.WEB_URL}/transactions?user_id=${user.id}`)],
            ])
        );
    }

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


        return newUser;
    }
    return findUser;
};
const phoneNumberValidator = (phoneNumber: string) => {
    // Regular expression for phone number validation
    const phoneRegex = /^\+998\d{9}$/;

    // Test the phone number against the regex
    return phoneRegex.test(phoneNumber);
};

