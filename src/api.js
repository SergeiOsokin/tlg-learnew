const { HOST } = require("../config/default");

const request = async (url, method, form = {}) => {
    console.log(form)
    const header = {
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({ form });
    const params = method === 'GET' ?
        { method, headers: header, body } : { method, body, headers: header, credentials: 'include' };
    try {
        const response = await fetch(`${HOST}${url}`, params);
        const data = await response.json();

        if (responce.hasOwnProperty('error')) {
            await ctx.reply(responce.message || responce.error, keyboardError);
            return;
        };

        return data;
    } catch (error) {
        return ctx.reply('Попробуйте заново. У нас тут ошибка ⚙️', keyboardError);
    }
};

module.exports = {
    request
}