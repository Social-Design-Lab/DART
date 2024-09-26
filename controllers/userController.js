import passport from 'passport';
import validator from 'validator';
// app.get("/courses", coursesController.index);
import logger from '../config/logger/index.js';
import User from '../sequelize/models/User.js'; // Adjust path to the correct location of the Sequelize User model

import UserAccessLog from '../sequelize/models/UserAccessLog.js'; // Adjust path to the correct location of the Sequelize User model
import UAParser from 'ua-parser-js';

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
  
    passport.authenticate('local', async (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('errors', info);
            await logUserAccess('login-failure', req, null);
            return res.redirect('/login');
        }
        
        // passport adds the authenticated user object to the request object as req.user
        req.logIn(user, async (err) => {
            if (err) { return next(err); }
            await logUserAccess('login', req, user.id);
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

      logger.info(`Guest User Created: ID: ${user.id}, email: ${user.email}, name: ${user.name}, accountType: ${user.account_type}`);


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


        // Add to the user access log
        await logUserAccess("signup-guest", req, user.id);

  
        // Redirect the guest user to the selection page
        return res.redirect('/selection');
      });
    } catch (err) {

        await logUserAccess('signup-guest-failure', req, null);
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

    logger.debug('In postSignup function');

    logger.debug(`CSRF Token in body: ${csrfTokenInBody}`);
    logger.debug(`CSRF Token in session: ${csrfTokenInSession}`);
    logger.debug(`Request body: ${JSON.stringify(req.body)}`);

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

        logger.info(`User created: ID: ${user.id}, email: ${user.email}, name: ${user.name}, accountType: ${user.account_type}`);
        // Ensure user creation was successful before logging access
        if (!user || !user.id) {
          logger.error('User creation failed: User object or ID is null, cannot log access');
          return next(new Error('User creation failed, cannot log access'));
        }

        // Log the user in
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }

            // Add to the user access log
            await logUserAccess('signup', req, user.id);

            res.redirect('/selection');
        });
    } catch (err) {
      req.session.destroy(async (sessionErr) => {
        if (sessionErr) {
            logger.error(`Error destroying session: ${sessionErr}`);
            await logUserAccess('signup-failure-destroying-session', req, null);
            return next(sessionErr);
        }
        logger.error(`Error during signup process: ${err}`);
        await logUserAccess('signup-failure', req, null);
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

// logUserAccess function
const logUserAccess = async (action, req, createdUserId) => {
    // log action
    logger.info(`Logging user access log action: ${action}`);

    // Capture additional client-side data
    const { 
        screen_width, 
        screen_height, 
        viewport_width, 
        viewport_height, 
        device_memory, 
        cpu_cores, 
        connection_type, 
        downlink, 
        time_zone, 
        language, 
        referrer, 
        cookies_enabled, 
        is_touch_device, 
        zoom_level, 
        device_pixel_ratio, 
        screen_orientation,
        prefers_color_scheme,
        prefers_reduced_data,
        prefers_reduced_motion,
        prefers_high_contrast,
        prefers_contrast
    } = req.body;

    // Get IP address
    const ip_address = req.headers['x-forwarded-for'] 
              ? req.headers['x-forwarded-for'].split(',')[0] 
              : req.connection.remoteAddress;

    // Get User-Agent details
    const user_agent = req.headers['user-agent'];
    const parser = new UAParser(user_agent);
    const page_accessed = req.originalUrl || 'Unknown';

    // Parse browser, OS, device, engine, and CPU info
    const { name: browser_name, version: browser_version } = parser.getBrowser();
    const { name: os_name, version: os_version } = parser.getOS();
    const { model: device_model, type: device_type, vendor: device_vendor } = parser.getDevice();
    const { name: engine_name, version: engine_version } = parser.getEngine();
    const { architecture: cpu_architecture } = parser.getCPU();

    try {
        // Create User Access Log
        await UserAccessLog.create({
            user_id: createdUserId,
            action: action,
            page_accessed: page_accessed,
            ip_address: ip_address,
            user_agent: user_agent,
            browser_name: browser_name || 'Unknown',
            browser_version: browser_version || 'Unknown',
            os_name: os_name || 'Unknown',
            os_version: os_version || 'Unknown',
            device_model: device_model || 'Unknown',
            device_type: device_type || 'Unknown',
            device_vendor: device_vendor || 'Unknown',
            cpu_architecture: cpu_architecture || 'Unknown',
            engine_name: engine_name || 'Unknown',
            engine_version: engine_version || 'Unknown',
            screen_width: screen_width,
            screen_height: screen_height,
            viewport_width: viewport_width,
            viewport_height: viewport_height,
            device_memory: device_memory,
            cpu_cores: cpu_cores,
            connection_type: connection_type,
            downlink: downlink,
            time_zone: time_zone,
            language: language,
            referrer: referrer,
            cookies_enabled: cookies_enabled,
            is_touch_device: is_touch_device,
            zoom_level: zoom_level,
            device_pixel_ratio: device_pixel_ratio,
            screen_orientation: screen_orientation,
            prefers_color_scheme: prefers_color_scheme,
            prefers_reduced_data: prefers_reduced_data,
            prefers_reduced_motion: prefers_reduced_motion,
            prefers_high_contrast: prefers_high_contrast,
            prefers_contrast: prefers_contrast
        });

        logger.info(`User access log created successfully for user ID: ${createdUserId} from IP: ${ip_address}`);
    } catch (error) {
        logger.error(`Failed to create user access log for user ID: ${createdUserId}. Error: ${error.message}`);
        throw error; // Rethrow error for handling in the calling function
    }
};
