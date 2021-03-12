const { User, Recipe, Review, Follow, sequelize, Sequelize : {Op} } = require('../config/database');
const HttpError = require('../helpers/http-error');
const { SEARCH_LIMIT } = require('../constants');

const getUserByUsername = async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            attributes: ['username', 'id', 'firstName', 'lastName', 'profilePic', 'bio'],
            where: { username: req.params.username }
        })
        if (!user) throw new HttpError('Could not find resource', 404)
        res.json({ data: user })
    } catch(err) {
        return next(err);
    }
}

const getUserStats = async (req, res, next) => {
    const username = req.params.username;
    //get user follower count, following count, recipe count
    try {
        const stats = {};
        const user = await User.findOne({ 
            attributes: ['username'],
            include: [
                { model: Recipe, as: 'userRecipes', attributes: ['id'] }, 
                { model: User, as: 'followers', attributes: ['username'] }, 
                { model: User, as: 'following', attributes: ['username'] }
            ],
            where: { username: username }
        });
        if (!user) throw new HttpError('Could not find resource', 404);
        stats.recipeCount = user.userRecipes.length;
        stats.followerCount = user.followers.length;
        stats.followingCount = user.following.length;
        
        res.json({ data: stats })
    } catch(err) {
        return next(err);
    }
}

const getGivenUsersFollowers = async (req, res, next) => {
    const username = req.params.username;
    //concat the most recently fetched follower's firstname, lastname, username (for offset)
    const { ff, fl, fu } = req.query;
    const lastFetchedUser = ff ? ff.concat(fl, fu) : '';
    try {
        const followee = await User.findOne({ where: { username }})
        const follows = await Follow.findAll({
            where: { followeeId: followee.id },
            include: [
                { 
                    model: User, 
                    as: 'follower', 
                    attributes: [
                        'username', 'id', 'firstName', 'lastName', 'profilePic'
                    ],
                    where: sequelize.where(
                        sequelize.fn(
                            'concat', 
                            sequelize.fn('lower', sequelize.col('first_name')),
                            sequelize.fn('lower', sequelize.col('last_name')),
                            sequelize.fn('lower', sequelize.col('username'))
                        ), { [Op.gt]: lastFetchedUser }
                    ) 
                }
            ],
            order: [
                [{ model: User, as: 'follower' }, 'firstName', 'ASC'],
                [{ model: User, as: 'follower' }, 'lastName', 'ASC'],
                [{ model: User, as: 'follower' }, 'username', 'ASC']
            ],
            limit: 20
        })
        const followers = follows.map(f => f.follower)
        res.json({ data: followers })
    } catch(err) {
        return next(err);
    }
}

const getGivenUsersFollowing = async (req, res, next) => {
    const username = req.params.username; 
    const { ff, fl, fu } = req.query;
    const lastFetchedUser = ff ? (ff.concat(fl, fu)).toLowerCase() : '';

    try {
        const follower = await User.findOne({ where: { username }})
        const follows = await Follow.findAll({
            where: { followerId: follower.id },
            include: [
                { 
                    model: User, 
                    as: 'followee', 
                    attributes: [
                        'username', 'id', 'firstName', 'lastName', 'profilePic'
                    ],
                    where: sequelize.where(
                        sequelize.fn(
                            'concat', 
                            sequelize.fn('lower', sequelize.col('first_name')),
                            sequelize.fn('lower', sequelize.col('last_name')),
                            sequelize.fn('lower', sequelize.col('username'))
                        ), { [Op.gt]: lastFetchedUser }
                    ) 
                }
            ],
            order: [
                [{ model: User, as: 'followee' }, 'firstName', 'ASC'],
                [{ model: User, as: 'followee' }, 'lastName', 'ASC'],
                [{ model: User, as: 'followee' }, 'username', 'ASC']
            ],
            limit: 20
        })
        const followees = follows.map(f => f.followee)
        res.json({ data: followees })
    } catch(err) {
        return next(err);
    }
}

const getUserSearchResults = async (req, res, next) => {
    let { q, o, filter } = req.query;
    let limitAndOffset = { limit: SEARCH_LIMIT, offset: parseInt(o) || 0 };
    if (!q) return res.json({ data: [] });
    q = q.trim();
    try {
        switch (filter) {
            case "username":
                results = await User.findAll({ 
                    where: { username: {[Op.iLike]: `%${q}%`} },
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt' ] },
                    ...limitAndOffset
                })
                break;
            case "first":
                results = await User.findAll({ 
                    where: { firstName: {[Op.iLike]: `%${q}%`} },
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt' ] },
                    ...limitAndOffset
                })
                break;
            case "last":
                results = await User.findAll({ 
                    where: { lastName: {[Op.iLike]: `%${q}%`} },
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt' ] },
                    ...limitAndOffset
                })
                break;
            case "full":
                results = await User.findAll({
                    where: {
                        [Op.or]: [
                            { firstName: {[Op.iLike]: `%${q}%`} },
                            { lastName: {[Op.iLike]: `%${q}%`} },
                            sequelize.where(sequelize.fn('concat', sequelize.col('first_name'), ' ', sequelize.col('last_name')), {
                                [Op.iLike]: `%${q}%`
                            })
                        ]
                    },
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt' ] },
                    ...limitAndOffset
                })
                break;
            default:
                results = await User.findAll({
                    where: {
                        [Op.or]: [
                            { firstName: {[Op.iLike]: `%${q}%`} },
                            { lastName: {[Op.iLike]: `%${q}%`} },
                            { username: {[Op.iLike]: `%${q}%`} },
                            sequelize.where(sequelize.fn('concat', sequelize.col('first_name'), ' ', sequelize.col('last_name')), {
                                [Op.iLike]: `%${q}%`
                            })
                        ]
                    },
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt' ] },
                    ...limitAndOffset
                })
                break;
        }
        res.json({ data: results })
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getUserByUsername,
    getUserStats,
    getGivenUsersFollowers,
    getGivenUsersFollowing,
    getUserSearchResults
}