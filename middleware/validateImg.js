const HttpError = require('../helpers/http-error')

function validateImg(sizeLimit) {
    return (req, res, next) => {
        if (!req.file) return next(new HttpError('Bad request', 400));
        if (req.file.size > sizeLimit) return next(new HttpError('Bad request - file size too large', 400));
        if (!['image/jpeg','image/jpg','image/png'].incudes(req.file.mimetype)) {
            return next(new HttpError('Bad request - invalid file format', 400))
        };
        next()
    }
}

module.exports = validateImg