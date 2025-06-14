const express = require('express');
const Router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Ground = require('../models/campground')   
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, validateCamp, isAuthor } = require('../middleware.js')
const Campgrounds = require('../controllers/campgrounds.js')
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })

Router.route('/')
    .get(catchAsync(Campgrounds.index)) 
    .post(isLoggedIn,upload.array('image'), validateCamp,catchAsync(Campgrounds.postCampground));
    // .post(upload.array('image'), (req,res) => {
    //     res.send('it worked');
        // res.status(200).send({ body: req.body, file: req.file });
    // })

Router.get('/create', isLoggedIn, Campgrounds.renderNewForm)

Router.route('/:id')
    .get( isLoggedIn, catchAsync(Campgrounds.camp_details))
    .put(isLoggedIn, isAuthor ,upload.array('image'),validateCamp,catchAsync(Campgrounds.postUpdatedCamp))
    .delete(isLoggedIn, isAuthor, catchAsync(Campgrounds.deleteCamp))

Router.get('/:id/edit', isLoggedIn, isAuthor ,catchAsync(Campgrounds.renderUpdateForm))

module.exports = Router;

// Router.get('/',catchAsync(Campgrounds.index)) 
// Router.post('/', isLoggedIn, validateCamp,catchAsync(Campgrounds.postCampground)) 
// Router.get('/:id', isLoggedIn, catchAsync(Campgrounds.camp_details))



// Router.put('/:id',isLoggedIn, isAuthor ,validateCamp,catchAsync(Campgrounds.postUpdatedCamp))
// Router.delete('/:id', isLoggedIn, isAuthor, catchAsync(Campgrounds.deleteCamp)) 

