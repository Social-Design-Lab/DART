import passport from 'passport';
import validator from 'validator';

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

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: '/login'
    })(req, res, () => {
        res.redirect('/');
    });
};

