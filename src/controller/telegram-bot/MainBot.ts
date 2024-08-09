import {Markup, Telegraf} from 'telegraf';
import {Request, Response} from 'express';
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/db";
import {Context} from "node:vm";
import {Wallet} from "../../entity/Wallet";
import {Currency} from "../../entity/Currency";
import {Payme} from "../../entity/paymentBot/Payme";
import axios from "axios";

const bot = new Telegraf('7358372482:AAFuMMugTfaRW_ddW0VhlYLOTNrDGK4Fc30');
const userRepository = AppDataSource.getRepository(User);
const walletRepository = AppDataSource.getRepository(Wallet);
const currencyRepository = AppDataSource.getRepository(Currency);
const paymeRepository = AppDataSource.getRepository(Payme);

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
            await userHome(ctx);
            // Yangi holatga o'tkazish yoki boshqa amallarni bajarish
            await updateUserState(ctx.chat.id.toString(), 'user_home');
        } else {
            // Tekshiruv muvaffaqiyatsiz
            ctx.reply('Iltimos, ismingiz va familiyangizni to\'g\'ri kiriting. Ikkalasi ham kamida 3 harfdan iborat bo\'lishi kerak.');
        }
    } else if (user.state == 'send_payme_number') {
        if (phoneNumberValidator(ctx.message.text)) {

            const payme = await paymeRepository.findOne({where: {user_id: user.id}});
            if (!payme) {
                await paymeRepository.save(
                    paymeRepository.create({
                        user_id: user.id,
                        phone_number: ctx.message.text
                    }));
            } else {
                payme.phone_number = ctx.message.text;
                await paymeRepository.save(payme)
            }
            await updateUserState(ctx.chat.id.toString(), 'send_payme_parol');
            await ctx.reply("Telefon raqamingiz tasdiqlandi. Endi Paymega kirish parolingizni kiriting.");
        } else {
            await ctx.reply("Noto'g'ri telefon raqami. Iltimos, +998 bilan boshlanuvchi 9 ta raqam kiriting.",
                Markup.keyboard([
                    Markup.button.text("Bekor qilish")
                ]).oneTime().resize()
            );
        }
    } else if (user.state == "send_payme_parol") {
        // Send POST request to Payme API
        const payme = await paymeRepository.findOne({where: {user_id: user.id}});
        if (payme) {

            const res = await paymeLogin(
                {
                    method: 'users.log_in',
                    params: {
                        login: payme?.phone_number,
                        password: ctx.message.text
                    }
                }, null, payme);

            const resSms: any = await axios.post(process.env.PAYME_URL + 'sessions.get_activation_code', {
                method: 'sessions.get_activation_code'
            }, {
                headers: {
                    'API-SESSION': res.headers['api-session']
                }
            })
            if (payme) {
                payme.session = res.headers['api-session'];
                payme.password = ctx.message.text;
                await paymeRepository.save(payme);
            }

            if (resSms.data.result.sent) {
                await ctx.reply(resSms.data.result.phone + " Raqamiga sms kod jo'natildi. Kodning kirgizing");
                await updateUserState(ctx.chat.id.toString(), 'send_payme_smskod');
            }
        }
    } else if (user.state == "send_payme_smskod") {
        if (ctx.message.text) {
            const payme = await paymeRepository.findOne({where: {user_id: user.id}});

            if (payme) {
                const res = await axios.post(process.env.PAYME_URL + "sessions.activate", {
                    params: {
                        code: ctx.message.text,
                        to_reserve: false,
                    },
                    method: 'sessions.activate',
                }, {
                    headers: {
                        'API-SESSION': payme.session
                    }
                });
                payme.session = res.headers['api-session'];
                await paymeRepository.save(payme);


                const registerDevice: any = await axios.post(process.env.PAYME_URL + 'devices.register', {
                    params: {
                        display: "AllPayBot",
                        type: 2,
                    },

                    method: "devices.register",
                }, {
                    headers: {
                        'API-SESSION': res.headers['api-session']
                    }
                });
                if (registerDevice.data.result.key) {
                    payme.device = registerDevice.data.result._id + "; " + registerDevice.data.result.key + ";";
                    payme.device_id = registerDevice.data.result._id;
                    payme.device_key = registerDevice.data.result.key;
                    await paymeRepository.save(payme);
                }
                await axios.post(process.env.PAYME_URL + "cards.get_all", null, {
                    headers: {
                        'API-SESSION': payme.session,
                        'Device': payme.device_id
                    }
                })

                await ctx.reply("Paymega muvaffaqiyatli ulandingiz");
                userHome(ctx);

            }
        }
    }
});


bot.action('pay:payme', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
    await ctx.reply("Paymega ulangan telefon raqamingizni yozing.");
    await updateUserState(ctx.from.id.toString(), 'send_payme_number');
});

bot.action('pay:click', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
    await ctx.reply("Clickga ulangan telefon raqamingizni yozing.");
    await updateUserState(ctx.from.id.toString(), 'send_click_number');
});

bot.action('pay:humans', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
    await ctx.reply("Humansga ulangan telefon raqamingizni yozing.");
    await updateUserState(ctx.from.id.toString(), 'send_humans_number');
});

bot.action('pay:uzum', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
    await ctx.reply("UzumBankga ulangan telefon raqamingizni yozing.");
    await updateUserState(ctx.from.id.toString(), 'send_uzum_number');
});

//HOMES
bot.action('pay:payme-home', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
    // await ctx.reply("UzumBankga ulangan telefon raqamingizni yozing.");
    const user = await getBotUser(ctx.from.id.toString());

    const payme = await paymeRepository.findOne({where: {user_id: user.id}});
    if (payme) {
        const login = await paymeLogin({
            params: {
                login: payme.phone_number,
                password: payme.password
            },
            method: "users.log_in",
        }, {
            headers: {
                'Device': payme.device,
                'Content-Type': 'text/plain',
                'Accept': '*/*',
                'Connection': 'keep-alive'
            }
        }, payme);

        const myCards: any = await axios.post(process.env.PAYME_URL + 'cards.get_all', {
            method: 'cards.get_all'
        }, {
            headers: {
                'API-SESSION': login.headers['api-session'],
                'Device': payme.device
            }
        });

        let send_text = "💳 <b>Barcha kartalaringiz</b>\n\n";
        myCards.data.result.cards.forEach((card: any) => {
            // Mask the middle digits of the card number
            send_text += `📝 <b>Nomi</b>: ${card.name}\n`;
            send_text += `🔢 <b>Raqam</b>: ${card.number.toString().slice(0, 6) + '******' + card.number.toString().slice(-4)}\n`;
            send_text += `📅 <b>Muddati</b>: ${card.expire}\n`;
            send_text += `💰 <b>Hisob</b>: ${(card.balance / 100).toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS' })}\n`;
            send_text += "------------\n\n";
        });
        await ctx.replyWithHTML(send_text);




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
    const payme = await paymeRepository.findOne({where: {user_id: user.id}})
    await ctx.reply(
        "All Pay Botimizga hush kelibsiz. O'zingizga mos To'lov tizimini tanlang",
        Markup.inlineKeyboard([
            [Markup.button.callback("Payme " + (payme ? '✅' : ''), payme ? 'pay:payme-home' : 'pay:payme'), Markup.button.callback("Click", 'pay:click')],
            [Markup.button.callback("Humans", 'pay:humans'), Markup.button.callback("Uzum Bank", 'pay:uzum')],
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
const phoneNumberValidator = (phoneNumber: string) => {
    // Regular expression for phone number validation
    const phoneRegex = /^\+998\d{9}$/;

    // Test the phone number against the regex
    return phoneRegex.test(phoneNumber);
};

const paymeLogin = async (body: any, headers: any, payme: Payme) => {

    const login = await axios.post(process.env.PAYME_URL + "users.log_in", body, headers);
    payme.is_active_session = !!payme.device;
    payme.session = login.headers['api-session'];
    await paymeRepository.save(payme);
    return login;
}