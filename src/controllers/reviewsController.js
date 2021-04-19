const { User, Review, Recipe, Notification, sequelize } = require('../models');
const HttpError = require('../helpers/http-error');
const { updateById } = require('../helpers/query-helpers');
const { validatePic, uploadPic, deletePic } = require('../helpers/file-uploads')

const createReview = async (req, res, next) => {
    //client sends all non-file fields in one stringified form field called 'formJSON'
    let newReview = { userId: req.user.userId, ...JSON.parse(req.body.formJSON) };
    try {
        const reviewExists = await Review.findOne({ where: { userId: newReview.userId, recipeId: newReview.recipeId }});
        if (reviewExists) throw new HttpError('Review already exists', 400);
        newReview.reviewImg = null;
        if (req.file) {
            const picFileError = validatePic(req.file, 1024000);
            if (picFileError) throw picFileError;
            newReview.reviewImg = await uploadPic(req.file.path, next);
        }
        
        //create and return new review & new notification
        const { newNotification, review } = await sequelize.transaction(async (t) => {
            const review = await Review.create(newReview, { transaction: t });
            const reviewedRecipe = await Recipe.findByPk(newReview.recipeId, {
                attributes: ['userId']
            }, { transaction: t })
            const newNotification = await Notification.create({
                recipientId: reviewedRecipe.userId,
                newReviewId: review.id,
                category: 'review'
            }, { transaction: t })
            await Notification.notify(newNotification.id, { transaction: t });
            return { newNotification, review };
        })

        newReview = review;
        
        const updates = await Recipe.findByPk(newReview.recipeId, {
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviewCount'],
                [sequelize.fn('AVG', sequelize.col('reviews.rating')), 'avgRating']
            ],
            include: [{ model: Review, as: 'reviews', include: [
                { model: User, as: 'user', attributes: ['username', 'profilePic']}
            ]}],
            order: [[{ model: Review, as: 'reviews' }, 'createdAt','DESC']],
            group: ['recipe.id', 'reviews.id', 'reviews->user.id']
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
        if (reviewPicURL) await deletePic(reviewPicURL)
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