import passport from 'passport';
import validator from 'validator';
import Users from '../sequelize/models/users.js';

export const getLogin = (req, res) => {
    res.render('login'); // Replace with your login view
};

export const postLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
};

export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
};

export const getSignup = (req, res) => {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/signup', {
      title: 'Create Account'
    });
};

export const postSignup = async (req, res, next) => {
    console.log("Req body: " + JSON.stringify(req.body));
    const validationErrors = [];
    
    // Validate input
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long.' });
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('/signup');
    }
  
    // Normalize the email
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
  
    try {
      // Check if the user already exists
      const existingUser = await Users.findOne({ where: { email: req.body.email } });
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that email address already exists.' });
        return res.redirect('/signup');
      }
  
      // Convert checkbox to boolean
      const tempConsent = req.body.newsletterConsent === 'on';
  
      // Create the new user
      const user = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        newsletterConsent: tempConsent
      });
  
      // Log the user in
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/selection');
      });
    } catch (err) {
      next(err);
    }
};

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: '/login'
    })(req, res, () => {
        res.redirect('/');
    });
};

