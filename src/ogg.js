// import axios from "axios";
// import { createWriteStream } from 'fs';
// import { dirname, resolve } from 'path'; // для работы с путями
// import { fileURLToPath } from 'url';
// import ffmpeg from "fluent-ffmpeg";
// import installer from '@ffmpeg-installer/ffmpeg';
// import { removeFile } from "./utils.js";

const axios = require("axios");
const { createWriteStream } = require('fs');
const { dirname, resolve } = require('path'); // для работы с путями
const { fileURLToPath } = require('url');
const ffmpeg = require("fluent-ffmpeg");
const installer = require('@ffmpeg-installer/ffmpeg');
const { removeFile } = require("./utils.js");

// const qwedirname = dirname(fileURLToPath(import.meta.url)) // текущая папка

const OggConverter = () => {
    // constructor() {
    //     ffmpeg.setFfmpegPath(installer.path) //путь до конвертора 
    //  };

    // toMp3(input, output) {
    //     try {
    //         const outputPath = resolve(dirname(input), `${output}.mp3`)// получаем путь до папки и сохраняем в нее файл
    //         return new Promise((resolve, reject) => {
    //             ffmpeg(input)
    //                 .inputOption('-t 30')
    //                 .output(outputPath)
    //                 .on('end', () => {
    //                     removeFile(input);// если все ок, удаляем файл ogg  
    //                     resolve(outputPath);// если все ок, возвращаем путь
    //                 }) 
    //                 .on('error', () => reject(error)) // если ошибка, возвращаем 
    //                 .run() // запуск
    //         })
    //     } catch (error) {
    //         console.log('Error create mp3 file', error)
    //     }
    // };

    // async create(url, fileName) {
    //     const oggPath = resolve(qwedirname, '../voices', `${fileName}.ogg`);
    //     try {
    //         // поток для скачивания файла
    //         const response = await axios({
    //             method: "GET",
    //             url,
    //             responseType: 'stream' //как скачиваем
    //         });
    //         // возвращаем промис, т.к. скачивание файла будет не моментально
    //         return new Promise(resolve => {
    //             // куда будем сохранять файл
    //             const stream = createWriteStream(oggPath);
    //             //
    //             response.data.pipe(stream);
    //             // когда поток записи завершиться, возвращаем путь до сохраненного файла
    //             stream.on('finish', () => resolve(oggPath));
    //         })
    //     } catch (error) {
    //         console.log('Error create ogg file', error)
    //     }
    // };
}

// export const ogg = new OggConverter();

module.exports = {
  OggConverter,
};