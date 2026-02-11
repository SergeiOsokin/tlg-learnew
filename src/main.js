// import { Telegraf, session } from 'telegraf';
// import { message } from 'Telegraf/filters';
// import { code } from 'Telegraf/format';
// import config from 'config';
// import { ogg } from './ogg.js'
// import { openai } from './openai.js';
require('dotenv').config();
const { Telegraf, session, Markup } = require('telegraf');
const { message } = require('Telegraf/filters');
const { code } = require('Telegraf/format');
const config = require('config');
const { ogg } = require('./ogg.js');
const { openai } = require('./openai.js');
const { TLG_TOKEN } = require('../config/default.js')
const { request } = require('../src/api.js');
const { mixArray } = require('../src/utils.js');

// принимает токен, который приходит из ТЛГ
// const bot = new Telegraf(config.get('TLG_TOKEN')); 
const bot = new Telegraf(TLG_TOKEN);
const INITIAL_SESSION = {
    messages: []
};

let words = [];
let authData = {
    token: '',
    email: ''
};

bot.action('wrongAnswer', async ctx => {

    await ctx.replyWithHTML(`<i>К сожалению, не верно. Попробуй еще раз </i>`)

    try {
        await ctx.replyWithHTML(`Перевод <b>${words[0].russian_word}</b> это:`,
            Markup.inlineKeyboard(mixArray([
                Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
            ])))

    } catch (error) {
        // console.log('Text error', error)
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', `${error}`);
    }
});

bot.action('rightAnswer', async ctx => {

    if (words.length <= 4) {
        return ctx.replyWithHTML(`<i>Абсолютно верно. Вы повторили все слова.  </i>`,
            Markup.keyboard([Markup.button.callback("Обновить слова", "reload")]),
        );
    }

    words = words.slice(1);

    await ctx.replyWithHTML(`<i>Абсолютно верно. Готовим новый вопрос: </i>`)

    try {
        await ctx.replyWithHTML(`Перевод <b>${words[0].russian_word}</b> это:`,
            Markup.inlineKeyboard([
                Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
            ]))
        // Markup.inlineKeyboard(mixArray([
        //     Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
        //     Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
        //     Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
        //     Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
        // ])))

    } catch (error) {
        // console.log('Text error', error)
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', `${error}`);
    }
});

// Набор стартовых кнопок после "авторизации" 
const keyboardStart = Markup.keyboard([
    Markup.button.callback("Повторение", "повторение"),
    Markup.button.callback("Заметки", "notice"),
    Markup.button.callback("/start", "start"),
]).oneTime()
    .resize();

const keyboardRepeat = Markup.keyboard([
    Markup.button.callback("Обновить слова", "repeat"),
    Markup.button.callback("Заметки", "notice"),
    Markup.button.callback("/start", "start"),
]).oneTime()
    .resize();

bot.hears("Обновить слова", async ctx => {
    Markup.removeKeyboard();
    ctx.replyWithHTML("<i>Обновляем список слов</i>");

    try {

        const responce = await request('/words', 'POST', {
            token: authData.token,
            email: authData.email
        });

        if (responce.hasOwnProperty('error')) {
            await ctx.reply(responce.error);
            return;
        };

        words = mixArray(responce.data);

        await ctx.reply(`У вас ${words.length} слов. Обновляем квиз`);

        ctx.replyWithHTML(`Перевод для <b>${words[0].russian_word}</b> это:`,
            Markup.inlineKeyboard([
                Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
                Markup.button.callback(`${words[2].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[4].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[5].foreign_word}`, "wrongAnswer"),
                // Markup.button.callback("Delete", "rightAnswer"),
            ]).oneTime()
                .resize())

    } catch (error) {
        // console.log('Text error', error)
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', `${error}`);
    }
})

// bot.command("pyramid", ctx => {
// 	return ctx.reply(
// 		"Keyboard wrap",
// 		Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
// 			wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
// 		}),
// 	);
// });

// bot.hears("Delete", ctx => {
//     ctx.replyWithHTML(
//         "<i>Я верну ?</i>",
//         Markup.keyboard(["Coke", "Pepsi"]),
//     );
// })

bot.use(session());
// новая сессия создается, когда нажимается команда NEW
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Введите токен доступа для получения слов');
});

bot.command("simple", ctx => {
    return ctx.replyWithHTML(
        "<b>Coke</b> or <i>Pepsi?</i>",
        Markup.keyboard(["Coke", "Pepsi"]),
    );
});

bot.start((ctx) => {
    const { id, username, first_name, last_name } = ctx.from;
    //     ctx.replyWithMarkdown(`Кто ты в телеграмме:
    // *id* : ${id}
    // *username* : ${username}
    // *Имя* : ${first_name}
    // *Фамилия* : ${last_name}
    // *chatId* : ${ctx.chat.id}`);
    // })
    // console.log('Контекст после "start" ', ctx.session)
    ctx.session ??= INITIAL_SESSION;
    Markup.removeKeyboard();
    ctx.reply(`Привет ${first_name}! Пришли токен для авторизации из своего кабинета learnew.ru `)
});

bot.hears('Повторение', async ctx => {
    Markup.removeKeyboard();

    await ctx.replyWithHTML("<i>🔍 Ищем ваши слова</i>");

    try {

        const responce = await request('/words', 'POST', {
            token: authData.token,
            email: authData.email
        });

        if (responce.hasOwnProperty('error')) {
            await ctx.reply(responce.error);
            return;
        };

        words = mixArray(responce.data);

        await ctx.reply(`У вас ${words.length} слов. Формируем квиз`, keyboardRepeat);

        ctx.replyWithHTML(`Перевод для <b>${words[0].russian_word}</b> это:`,
            Markup.inlineKeyboard([
                Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
                Markup.button.callback(`${words[2].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[4].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[5].foreign_word}`, "wrongAnswer"),
                // Markup.button.callback("Delete", "rightAnswer"),
            ]).oneTime()
                .resize());

    } catch (error) {
        // console.log('Text error', error)
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', `${error}`);
    }
});

bot.hears('Заметки', async ctx => {
    ctx.replyWithHTML("Скоро тут появится раздел с вашими заметками. Уже создаем 🧑‍💻", keyboardStart);
})

bot.on(message(regexp = /\$/gi), ctx => {
    return ctx.reply('Работает ⚙️', `${error}`);
});

// ловим введенный текст /^[a-f0-9]{32}$/gi
bot.on(message('text'), async ctx => {

    if (ctx.message.text.includes('$')) {
        try {
            // await ctx.reply(code('Принято, работаем'));
            // запрос в chatGPT и получение ответа
            authData.token = `${ctx.message.text}`; //добавляем контекст пользователя
            ctx.replyWithHTML("<i>Авторизация...</i>");
            const responce = await request('/login', 'POST', authData.token);
            if (responce.hasOwnProperty('error')) {
                // message(data.message || data.error, false);
                await ctx.reply(responce.error);
                Markup.removeKeyboard()
                return;
            }
            // await ctx.reply(code('Ждем ответ chatGPT'));
            // const responce = await openai.chat(ctx.session.messages);
            // ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: responce.content }); //добавляем контекст chatGPT
            authData.email = `${responce.email}`; //добавляем контекст пользователя

            await ctx.reply(responce.message, keyboardStart);
            // служебную информацию
            // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
            // await ctx.reply(mp3Path);
            // await ctx.reply(JSON.stringify(userId, null, 2));
        } catch (error) {
            console.log('Text error', error)
        }

    }
    //     // служебную информацию
    //     // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
    //     // await ctx.reply(mp3Path);
    //     // await ctx.reply(JSON.stringify(userId, null, 2));
    // } catch (error) {
    //     console.log('Text error', error)
    // }
})

// ловим голос, служебную информацию
// bot.on(message('voice'), async ctx => {
//     ctx.session ??= INITIAL_SESSION;

//     try {
//         await ctx.reply(code('Принято, работаем'));
//         const userId = String(ctx.message.from.id); // 
//         // работаем с первичным файлом 
//         const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id); //
//         const oggPath = await ogg.create(link.href, userId);
//         const mp3Path = await ogg.toMp3(oggPath, userId);

//         // конвертация голосового сообщения в текст
//         const text = await openai.transcription(mp3Path);
//         await ctx.reply(code(`Ваш запрос: ${text}`));
//         // запрос в chatGPT и получение ответа
//         ctx.session.messages.push({ role: openai.roles.USER, content: text }); //добавляем контекст пользователя
//         await ctx.reply(code('Ждем ответ chatGPT'));

//         const responce = await openai.chat(ctx.session.messages);
//         ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: responce.content }); //добавляем контекст chatGPT

//         await ctx.reply(responce.content);
//         // служебную информацию
//         // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
//         // await ctx.reply(mp3Path);
//         // await ctx.reply(JSON.stringify(userId, null, 2));
//     } catch (error) {
//         console.log('Voice error', error)
//     }
// })

// проверим, что в контексте, например, когда нажимается кнопка "старт", т.е. ловим команды/нажатия на кнопки
// bot.command('start', async (ctr) => {
//     await ctr.reply(JSON.stringify(ctx.message, null, 2))
// })

// запуск
bot.launch();

// Если что-то с node.js останавливаем бота
process.once('SIGINT', () => {
    Markup.removeKeyboard();
    bot.stop('SIGINT')
});
process.once('SIGTERM', () => {
    Markup.removeKeyboard();
    bot.stop('SIGTERM');
});