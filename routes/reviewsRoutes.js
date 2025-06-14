const express = require('express');
const Router = express.Router({ mergeParams: true });
const Review = require('../models/review.js')
const Ground = require('../models/campground') 
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor  } = require('../middleware.js')
const reviews = require('../controllers/reviews.js')

Router.post('/',  isLoggedIn, validateReview,  catchAsync(reviews.createReview))

Router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = Router;