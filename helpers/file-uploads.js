const cloudinary = require('cloudinary').v2;
const HttpError = require('./http-error');

async function uploadPic(filepath, next) {
    try {
        let url;
        await cloudinary.uploader.upload(filepath, {}, (err, result) => {
            url = result.secure_url;
        });
        return url;
    } catch (err) {
        const error = new HttpError('Problem uploading picture, please try again later', 500);
        return next(error);
    }
}

module.exports = uploadPic;