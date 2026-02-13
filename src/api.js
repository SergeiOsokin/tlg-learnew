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

        return data;
    } catch (error) {
        return error;
    }
};

module.exports = {
    request
}