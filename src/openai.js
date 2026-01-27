// import { Configuration, OpenAIApi } from "openai";
// import config from 'config';
// import { createReadStream } from 'fs';

const { Configuration, OpenAIApi } = require("openai");
const config = require('config');
const { createReadStream } = require('fs');

const OpenAI = () => {
    return 'Aeee'
}

// class OpenAI {
//     roles = {
//         ASSISTANT: 'assistant',
//         USER: 'user',
//         SYSTEM: 'system'
//     }

//     constructor(apiKey) {
//         const configuration = new Configuration({
//             apiKey: apiKey,
//         });
//         this.openai = new OpenAIApi(configuration);
//     };

//     async chat(messages) {
//         try {
//             const responce = await this.openai.createChatCompletion({
//                 model: 'gpt-3.5-turbo',
//                 messages
//             })
            
//             return responce.data.choices[0].message;
//         } catch (error) {
//             console.log('Error chatGPT', error)
//         }
//     };

//     async transcription(filePath) {
//         try {
//             const responce = await this.openai.createTranscription(
//                 createReadStream(filePath),
//                 'whisper-1'
//             ); // отправляем файл на конвертацию из речи в текст

//             return responce.data.text;
//         } catch (error) {
//             console.log('Error transcription', error)
//         }
//      };
// }

// export const openai = new OpenAI(config.get('OPENAI_API_KEY'));