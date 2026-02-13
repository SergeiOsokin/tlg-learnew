// import { Telegraf, session } from 'telegraf';
// import { message } from 'Telegraf/filters';
// import { code } from 'Telegraf/format';
// import config from 'config';
// import { ogg } from './ogg.js'
// import { openai } from './openai.js';
require('dotenv').config();
const { Telegraf, session, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
const { code } = require('Telegraf/format');
const config = require('config');
const { ogg } = require('./ogg.js');
const { openai } = require('./openai.js');
const { TLG_TOKEN } = require('../config/default.js')
const { request } = require('../src/api.js');
const { mixArray } = require('../src/utils.js');

// принимает токен, который приходит из ТЛГ
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

    await ctx.replyWithHTML(`<i>К сожалению, не верно. Попробуй еще раз: </i>`)

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
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', keyboardError);
    }
});

bot.action('rightAnswer', async ctx => {

    if (words.length <= 4) {
        return ctx.replyWithHTML(`<i>Абсолютно верно. Вы повторили все слова.  </i>`,
            keyboardRepeat,
        );
    }

    words = words.slice(1);

    await ctx.replyWithHTML(`<i>Абсолютно верно. Следующий вопрос: </i>`)

    try {
        await ctx.replyWithHTML(`Перевод <b>${words[0].russian_word}</b> это:`,
            Markup.inlineKeyboard(mixArray([
                Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[Math.floor(Math.random() * words.length)].foreign_word}`, "wrongAnswer"),
            ])))

    } catch (error) {
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', keyboardError);
    }
});

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

const keyboardError = Markup.keyboard([
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
            await ctx.reply(responce.message || responce.error, keyboardError);
            return;
        };

        words = mixArray(responce.data);

        await ctx.reply(`У вас ${words.length} слов. Обновляем квиз`, keyboardRepeat);

        ctx.replyWithHTML(`Перевод для <b>${words[0].russian_word}</b> это:`,
            Markup.inlineKeyboard(mixArray([
                Markup.button.callback(`${words[0].foreign_word}`, "rightAnswer"),
                Markup.button.callback(`${words[2].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[4].foreign_word}`, "wrongAnswer"),
                Markup.button.callback(`${words[5].foreign_word}`, "wrongAnswer"),
            ])).oneTime()
                .resize())

    } catch (error) {
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', keyboardError);
    }
})

bot.use(session());
// новая сессия создается, когда нажимается команда NEW
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Введите токен доступа для получения слов');
});


bot.start((ctx) => {
    const { id, username, first_name, last_name } = ctx.from;
    ctx.session ??= INITIAL_SESSION;
    Markup.removeKeyboard();
    ctx.reply(`Привет ${first_name}! Пришли токен из своего кабинета learnew.ru `)
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
            await ctx.reply(responce.message || responce.error, keyboardError);
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
            ]).oneTime()
                .resize());

    } catch (error) {
        ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', keyboardError);
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
            authData.token = `${ctx.message.text}`; //добавляем контекст пользователя
            ctx.replyWithHTML("<i>Авторизация...</i>");

            const responce = await request('/login', 'POST', authData.token);

            if (responce.hasOwnProperty('error')) {
                await ctx.reply(responce.message || responce.error, keyboardError);
                Markup.removeKeyboard()
                return;
            }

            authData.email = `${responce.email}`; //добавляем контекст пользователя

            return await ctx.reply(responce.message, keyboardStart);
        } catch (error) {
            return ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', keyboardError);
        }
    };

    ctx.reply('Проблема с токеном. Обновите в личном кабинете learnew.ru и повторите попытку', keyboardError);
})

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