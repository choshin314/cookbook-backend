const express = require('express');
const router = express.Router();
const verifyAuth = require('../middleware/verifyAuth');
const multer = require('multer');
const { createReview, updateReview, deleteReview } = require('../controllers/reviewsController');
const upload = multer({ dest: '../uploads/'});

router.use(verifyAuth);

router.post('/', upload.single('reviewImg'), createReview)

router.patch('/:reviewId', upload.single('reviewImg'), updateReview)

router.delete('/:reviewId', deleteReview)

module.exports = router;