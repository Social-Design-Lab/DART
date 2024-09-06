import passport from 'passport';
import validator from 'validator';
import User from '../sequelize/models/user.js';  // Ensure the User model is correctly imported

// Render the login page
export const getLogin = (req, res) => {
    res.render('login'); // Replace with your login view
};

// Handle login requests
export const postLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
};

// Handle logout requests
export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
};

// Render the signup page
export const getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/signup', {
        title: 'Create Account'
    });
};

// Handle signup requests
export const postSignup = async (req, res, next) => {
    console.log("Req body: " + JSON.stringify(req.body));
    const validationErrors = [];

    // Validate input
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long.' });

    if (validationErrors.length) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            req.flash('errors', validationErrors);
            return res.redirect('/signup');
        });
        return;
    }

    // Normalize the email
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            req.session.destroy((err) => {
                if (err) {
                    return next(err);
                }
                req.flash('errors', { msg: 'Account with that email address already exists.' });
                return res.redirect('/signup');
            });
            return;
        }

        // Convert checkbox to boolean
        const tempConsent = req.body.newsletterConsent === 'on';

        // Create the new user
        const user = await User.create({
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
        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                return next(sessionErr);
            }
            next(err);
        });
    }
};

export const postAvatar = async (req, res, next) => {
    const { avatar, avatarImg } = req.body;
  
    try {
      // Find the user by email using Sequelize
      const existingUser = await User.findOne({ where: { email: req.user.email } });
  
      if (existingUser) {
        // Update the user's avatar fields
        existingUser.avatar = avatar;
        existingUser.avatar_img = avatarImg; // Use avatar_img if that's how the field is named
  
        // Save to PostgreSQL database via Sequelize
        await existingUser.save();
  
        // Manually update the user object in the session
        // req.session.passport.user.avatar = avatar;
        // req.session.passport.user.avatar_img = avatarImg;
  
        // Save the session to persist the changes
        req.session.save((err) => {
          if (err) {
            return next(err);
          }
  
          // Send a success response or redirect
          res.status(200).send('Avatar updated successfully');
        });
  
      } else {
        // Handle the case where the user is not found
        res.status(404).send('User not found while updating avatar');
      }
    } catch (err) {
      // Handle any errors during the process
      next(err);
    }
  };
  

// export const postSignup = async (req, res, next) => {
//     console.log("Req body: " + JSON.stringify(req.body));
//     const validationErrors = [];
    
//     // Validate input
//     if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
//     if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long.' });
  
//     if (validationErrors.length) {
//         req.flash('errors', validationErrors);
//         return res.redirect('/signup');
//     }
  
//     // Normalize the email
//     req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
  
//     try {
//         // Check if the user already exists
//         const existingUser = await User.findOne({ where: { email: req.body.email } });
//         if (existingUser) {
//             req.flash('errors', { msg: 'Account with that email address already exists.' });
//             return res.redirect('/signup');
//         }
  
//         // Convert checkbox to boolean
//         const tempConsent = req.body.newsletterConsent === 'on';
  
//         // Create the new user
//         const user = await User.create({
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password,
//             newsletterConsent: tempConsent
//         });
  
//         // Log the user in
//         req.logIn(user, (err) => {
//             if (err) {
//                 return next(err);
//             }
//             res.redirect('/selection');
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// Handle Google OAuth authentication
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Handle Google OAuth callback
export const googleCallback = (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: '/login'
    })(req, res, () => {
        res.redirect('/');
    });
};
