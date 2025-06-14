const Review = require('../models/review.js')
const Ground = require('../models/campground')

module.exports.createReview = async(req,res) => {
    const { id } = req.params;
    const campground = await Ground.findById(id);
    const review = new Review(req.body.review);
    // console.log(review); 
    review.author = req.user._id;
    campground.reviews.push(review);    
    await review.save();
    await campground.save();
    req.flash('success', 'Your thoughts are now live! Thanks for contributing.')
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview = async(req,res) => {
    const { id, reviewId } = req.params
    await Ground.findByIdAndUpdate(id, {$pull : { reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review has been taken down.')
    res.redirect(`/campgrounds/${id}`);
}