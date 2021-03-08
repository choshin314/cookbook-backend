const cloudinary = require('cloudinary').v2;
const HttpError = require('./http-error');

function validatePic(file, sizeLimit) {
    if (!file || !file.size || !file.mimetype) return new HttpError('Bad request', 400);
    if (file.size > sizeLimit) return new HttpError('Bad request - file size too large', 400);
    if (!['image/jpeg','image/jpg','image/png'].includes(file.mimetype)) {
        return new HttpError('Bad request - invalid file format', 400)
    };
    return null;
}

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

async function deletePic(fileURL) {
    const splitURL = fileURL.split('/');
    const filename = splitURL[splitURL.length - 1];
    const publicID = filename.split('.')[0];
    return await cloudinary.uploader.destroy(publicID)
}

module.exports = { validatePic, uploadPic, deletePic };