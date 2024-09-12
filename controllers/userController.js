import passport from 'passport';
import validator from 'validator';
import User from '../sequelize/models/user.js';  // Ensure the User model is correctly imported
import logger from '../config/logger/index.js';

/**
 * GET /login
 * Login page.
 */
export const getLogin = (req, res) => {
    if (req.user) {
      return res.redirect('/courses');
    }
    res.render('account/login', {
      title: 'Login',
      csrfToken: req.csrfToken()
    });
  };
  

// Handle login requests
export const postLogin = (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' });
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('/login');
    }
  
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
  
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', info);
        return res.redirect('/login');
      }
      
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        res.redirect(req.session.returnTo || '/courses');
      });
    })(req, res, next);
  };

  export const getGuest = async (req, res, next) => {
    try {
      if (req.params.modId === "delete") {
        // Avoiding a specific user behavior that causes 500 errors
        return res.send({
          result: "failure"
        });
      }
  
      // Generate a random guest name
      const guestName = "guest" + makeid(10);
  
      // Check if a guest with the same generated name already exists
      const existingUser = await User.findOne({ where: { name: guestName } });
  
      if (existingUser) {
        req.flash('errors', { msg: 'Error: Account with that guest name already exists.' });
        return res.redirect('/');
      }
  
      // If no existing user found, create a new guest user object
      const user = await User.create({
        password: "thinkblue", // Default guest password
        name: guestName,
        email: makeid(10) + "@gmail.com",
        account_type: "guest", 
        last_notify_visit: Date.now(),
      });
  
      // Log the user in using Passport.js
      req.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }
  
        const temp = req.session.passport;
  
        // Regenerate session and save the updated session
        await new Promise((resolve, reject) => {
          req.session.regenerate(err => {
            if (err) reject(err);
            req.session.passport = temp;
            req.session.save(err => {
              if (err) reject(err);
              resolve();
            });
          });
        });
  
        // Redirect the guest user to the selection page
        return res.redirect('/selection');
      });
    } catch (err) {
      return next(err);
    }
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

    // Pass CSRF token to the view template
    res.render('account/signup', {
        title: 'Create Account',
        csrfToken: req.csrfToken()
    });
};

// Handle signup requests
export const postSignup = async (req, res, next) => {
    const csrfTokenInBody = req.body._csrf || 'none';
    const csrfTokenInSession = req.session.csrfToken || 'none';
    
    logger.debug(`CSRF Token in body: ${csrfTokenInBody}`);
    logger.debug(`CSRF Token in session: ${csrfTokenInSession}`);

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
            account_type: 'full',
            newsletter_consent: tempConsent
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
    const csrfTokenInHeader = req.headers['csrf-token'] || 'none';  // Get CSRF token from headers
    const csrfTokenInSession = req.session.csrfToken || 'none';
    
    logger.debug(`CSRF Token in header: ${csrfTokenInHeader}`);
    logger.debug(`CSRF Token in session: ${csrfTokenInSession}`);
    
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
  
  //create random id for guest accounts
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  

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
