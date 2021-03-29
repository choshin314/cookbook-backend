const bcrypt = require('bcrypt');

const { User, sequelize } = require('../models');
const HttpError = require('../helpers/http-error');
const { uploadPic, deletePic, validatePic } = require('../helpers/file-uploads');
const { SEARCH_LIMIT } = require('../constants');

const updateAcctGeneralInfo = async (req, res, next) => {
    const userId = req.user.userId;
    const edits = req.body;
    const { email, username, bio } = edits;
    try {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User does not exist');
        if (email) {
            const emailTaken = await User.findOne({ 
                where: sequelize.where(
                    sequelize.fn('lower', sequelize.col('email')),
                    sequelize.fn('lower', email)
                )
            })
            if (emailTaken) throw new HttpError('This email address is unavailable', 400)
        }
        if (username) {
            const usernameTaken = await User.findOne({
                where: sequelize.where(
                    sequelize.fn('lower', sequelize.col('username')),
                    sequelize.fn('lower', username)
                )
            })
            if (usernameTaken) throw new HttpError('This username is unavailable', 400)
        }
        await user.update(edits);
        res.json({data: edits });
    } catch (err) {
        return next(err);
    }
}

const updateAcctPassword = async (req, res, next) => {
    const userId = req.user.userId;
    const { oldPassword, password } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User does not exist')
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) throw new HttpError('Current password does not match', 400); 
        const newHash = await bcrypt.hash(password, 10);
        await user.update({ password: newHash });
        res.json({data: 'success'})
    } catch (err) {
        return next(err)
    }
}

const updateProfilePic = async (req, res, next) => {
    const userId = req.user.userId;
    try {
        const picFileError = validatePic(req.file, 512000);
        if (picFileError) throw picFileError;
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User does not exist');
        const picToOverwrite = user.profilePic;
        const newPic = await uploadPic(req.file.path, next);
        await user.update({ profilePic: newPic });
        if (picToOverwrite) await deletePic(picToOverwrite);
        res.json({data: { profilePic: newPic }})
    } catch (err) {
        return next(err)
    }
}

module.exports = {
    updateAcctGeneralInfo,
    updateAcctPassword,
    updateProfilePic
}