const { User, Review, Recipe, sequelize } = require('../config/database')
const HttpError = require('../helpers/http-error');
const { updateById } = require('../helpers/query-helpers');
const { validatePic, uploadPic, deletePic } = require('../helpers/file-uploads')

const createReview = async (req, res, next) => {
    //client sends all non-file fields in one stringified form field called 'formJSON'
    const newReview = { userId: req.user.userId, ...JSON.parse(req.body.formJSON) };
    try {
        const reviewExists = await Review.findOne({ where: { userId: newReview.userId, recipeId: newReview.recipeId }});
        if (reviewExists) throw new HttpError('Review already exists', 400);
        let reviewImg = null;
        if (req.file) {
            const picFileError = validatePic(req.file, 1024000);
            if (picFileError) throw picFileError;
            reviewImg = await uploadPic(req.file.path);
        }
        newReview.reviewImg = reviewImg;
        await Review.create(newReview);
        const updates = await Recipe.findByPk(newReview.recipeId, {
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
                [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating']
            ],
            include: [{ model: Review, as: 'reviews', include: [
                { model: User, as: 'user', attributes: ['username', 'profilePic']}
            ]}],
            order: [[{ model: Review, as: 'reviews' }, 'createdAt','DESC']],
            group: ['Recipe.id', 'reviews.id', 'reviews->user.id']
        })
        res.json({ data: updates }); //sends back { data: { reviews: [...] }} 
    } catch (err) {
        return next(err);
    }
}

const updateReview = async (req, res, next) => {
    const reviewId = parseInt(req.params.reviewId);
    try {
        const edits = { userId: req.user.userId, ...JSON.parse(req.body.formJSON) };
        if (req.file) {
            const picFileError = validatePic(req.file, 1024000);
            if (picFileError) throw picFileError;
            const reviewImg = await uploadPic(req.file.path);
            edits.reviewImg = reviewImg; //only add reviewImg if there's actually a new img
        }
        const editResult = await updateById(Review, reviewId, edits);
        if (editResult.error) throw new Error(editResult.error);
        res.json({ data: editResult.data }) //sends back { data: { edited properties }}
    } catch (err) {
        return next(err);
    }
}

const deleteReview = async (req, res, next) => {
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.user.userId; 
    try {
        const userOwnedReview = await Review.findOne({ where: { userId, id: reviewId }})
        if (!userOwnedReview) throw new HttpError('User not authorized to delete this review', 403)
        const reviewPicURL = userOwnedReview.reviewImg
        await userOwnedReview.destroy()
        await deletePic(reviewPicURL)
        res.json({ data: userOwnedReview }) //sends back { data: { edited properties }}
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createReview,
    updateReview,
    deleteReview
}