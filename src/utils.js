const { unlink } = require('fs/promises');

const removeFile = async (path) => {
    try {
        await unlink(path);
    } catch (error) {
        console.log('Error remove file', error);
    }
}

module.exports = {

}