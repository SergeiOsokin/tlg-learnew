// import { Telegraf, session } from 'telegraf';
// import { message } from 'Telegraf/filters';
// import { code } from 'Telegraf/format';
// import config from 'config';
// import { ogg } from './ogg.js'
// import { openai } from './openai.js';
require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const { message } = require('Telegraf/filters');
const { code } = require('Telegraf/format');
const config = require('config');
const { ogg } = require('./ogg.js');
const { openai } = require('./openai.js');
const { TLG_TOKEN } = require('../config/default.js')
  
// принимает токен, который приходит из ТЛГ
// const bot = new Telegraf(config.get('TLG_TOKEN')); 
const bot = new Telegraf(TLG_TOKEN); 
const INITIAL_SESSION = {
    messages: []
}

bot.use(session());
// новая сессия создается, когда нажимается команда NEW
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего голосового или текстового сообщения');
});

bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего голосового или текстового сообщения');
});

// ловим введенный текст
bot.on(message('text'), async ctx => {
    ctx.session ??= INITIAL_SESSION;

    ctx.reply('Принято, работаем');

    // try {
    //     await ctx.reply(code('Принято, работаем'));
    //     await ctx.reply(code(`Ваш запрос: ${JSON.stringify(ctx.message.text, null, 2)}`));
    //     // запрос в chatGPT и получение ответа
    //     ctx.session.messages.push({role: openai.roles.USER, content: ctx.message.text}); //добавляем контекст пользователя
    //     await ctx.reply(code('Ждем ответ chatGPT'));
    //     const responce = await openai.chat(ctx.session.messages);
    //     ctx.session.messages.push({role: openai.roles.ASSISTANT, content: responce.content}); //добавляем контекст chatGPT

    //     await ctx.reply(responce.content);
    //     // служебную информацию
    //     // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
    //     // await ctx.reply(mp3Path);
    //     // await ctx.reply(JSON.stringify(userId, null, 2));
    // } catch (error) {
    //     console.log('Text error', error)
    // }
})

// ловим голос, служебную информацию
bot.on(message('voice'), async ctx => {
    ctx.session ??= INITIAL_SESSION;

    try {
        await ctx.reply(code('Принято, работаем'));
        const userId = String(ctx.message.from.id); // 
        // работаем с первичным файлом 
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id); //
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);

        // конвертация голосового сообщения в текст
        const text = await openai.transcription(mp3Path);
        await ctx.reply(code(`Ваш запрос: ${text}`));
        // запрос в chatGPT и получение ответа
        ctx.session.messages.push({role: openai.roles.USER, content: text}); //добавляем контекст пользователя
        await ctx.reply(code('Ждем ответ chatGPT'));
        
        const responce = await openai.chat(ctx.session.messages);
        ctx.session.messages.push({role: openai.roles.ASSISTANT, content: responce.content}); //добавляем контекст chatGPT

        await ctx.reply(responce.content);
        // служебную информацию
        // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
        // await ctx.reply(mp3Path);
        // await ctx.reply(JSON.stringify(userId, null, 2));
    } catch (error) {
        console.log('Voice error', error)
    }
})


// проверим, что в контексте, например, когда нажимается кнопка "старт", т.е. ловим команды/нажатия на кнопки
// bot.command('start', async (ctr) => {
//     await ctr.reply(JSON.stringify(ctx.message, null, 2))
// })

// запуск
bot.launch();

// Если что-то с node.js останавливаем бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));