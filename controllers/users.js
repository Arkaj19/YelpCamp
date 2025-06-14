const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

module.exports.renderRegisterForm = (req,res) =>{
    res.render('users/register')
}

module.exports.createRegisteredAccount = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Yelp Camp User ${username}`);
            res.redirect('/campgrounds'); // Only one redirect here
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLoginForm =  (req,res) =>{
    res.render('users/login')
}

module.exports.login = async(req,res) =>{
    req.flash('success', `Welcome Back!! ${req.user.username}` );
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    const username = req.user ? req.user.username : 'User';
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', `Goodbye! ${username} 😟😔`);
        res.redirect('/campgrounds');
    });
}