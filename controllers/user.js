const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const _ = require('lodash');
const validator = require('validator');
const mailChecker = require('mailchecker');
const User = require('../models/User');

const randomBytesAsync = promisify(crypto.randomBytes);

/**
 * Helper Function to Send Mail.
 */
const sendMail = (settings) => {
  const transportConfig = {
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  };

  let transporter = nodemailer.createTransport(transportConfig);

  return transporter.sendMail(settings.mailOptions)
    .then(() => {
      settings.req.flash(settings.successfulType, { msg: settings.successfulMsg });
    })
    .catch((err) => {
      if (err.message === 'self signed certificate in certificate chain') {
        console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
        transportConfig.tls = transportConfig.tls || {};
        transportConfig.tls.rejectUnauthorized = false;
        transporter = nodemailer.createTransport(transportConfig);
        return transporter.sendMail(settings.mailOptions)
          .then(() => {
            settings.req.flash(settings.successfulType, { msg: settings.successfulMsg });
          });
      }
      console.log(settings.loggingError, err);
      settings.req.flash(settings.errorType, { msg: settings.errorMsg });
      return err;
    });
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/courses');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
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
      // req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/courses');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) console.log('Error : Failed to logout.', err);
    req.session.destroy((err) => {
      if (err) console.log('Error : Failed to destroy the session during logout.', err);
      req.user = null;
      res.redirect('/');
    });
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = async (req, res, next) => {
  console.log("Req body: " + JSON.stringify(req.body));
  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
  if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
  // if (validator.escape(req.body.password) !== validator.escape(req.body.confirmPassword)) validationErrors.push({ msg: 'Passwords do not match' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/signup');
  }
  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }

    // convert checkbox to boolean
    let tempConsent;
    if(req.body.newsletterConsent === 'on') {
      tempConsent = true;
    } else {
      tempConsent = false;
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        newsletterConsent: tempConsent
    });
    await user.save();
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

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management',
    badges: req.user.badges 
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = async (req, res, next) => {
  console.log("In update profile!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log("Request Method: " + req.method);
  console.log("Request URL: " + req.url);
  // console.log("Request Headers: " + JSON.stringify(req.headers));
  console.log("Request body: " + JSON.stringify(req.body));

  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/account');
  }
  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
  try {
    const user = await User.findOne({ email: req.user.email});
    if (user.email !== req.body.email) user.emailVerified = false;
    user.email = req.body.email || '';
    user.name = req.body.name || '';
    // user.profile.gender = req.body.gender || '';
    // user.profile.location = req.body.location || '';
    // user.profile.website = req.body.website || '';
    await user.save();

    // manually update it in current session as well
    // req.user.moduleProgress.identity.percent = req.body.percent;
    // req.user.moduleProgress.identity.link = req.body.link;

    // req.session.passport.user = req.user;
    // await req.session.save();
    // req.flash('success', { msg: 'Profile information has been updated.' });
    // res.redirect('/account');

    // Better approach than manually, use req.login() to update the user in the session
    // update user in session then flash message / redirect
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      req.flash('success', { msg: 'Profile information has been updated.' });
      return res.redirect('/account');
    });

  } catch (err) {
    if (err.code === 11000) {
      req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
      return res.redirect('/account');
    }
    next(err);
  }
};

/**
 * POST /account/newsletter
 * Update current newsletter consent value.
 */
// exports.postUpdateNewsletter = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ email: req.user.email});
    
//     if (!user) {
//       // Handle the case where the user doesn't exist
//       req.flash('errors', { msg: 'User not found' });
//       return res.redirect('/account');
//     }

//     user.newsletterConsent = req.body.newsletterConsent;
//     await user.save();

//     // update the user in the session. Then flash message / redirect
//     req.login(user, (err) => {
//       if (err) {
//         return next(err);
//       }

//       req.flash('success', { msg: 'Newsletter subscription has been changed.' });
//       res.redirect('/account');
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = async (req, res, next) => {
  // console.log("req.body.password: ", req.body.password);
  // console.log("req.body.confirmPassword: ", req.body.confirmPassword);
  // console.log("req.body: ", req.body);
  const validationErrors = [];
  if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
  if (validator.escape(req.body.password) !== validator.escape(req.body.confirmPassword)) validationErrors.push({ msg: 'Passwords do not match' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/account');
  }

  try {
    const user = await User.findOne({ email: req.user.email});
    
    if (!user) {
      // Handle the case where the user doesn't exist
      req.flash('errors', { msg: 'User not found' });
      return res.redirect('/account');
    }

    user.password = req.body.password;
    await user.save();

    // update the user in the session. Then flash message / redirect
    req.flash('success', { msg: 'Password has been changed.' });
    req.session.save( function(){ res.redirect(`/account`); });

    // req.login(user, (err) => {
    //   if (err) {
    //     return next(err);
    //   }

    //   req.flash('success', { msg: 'Password has been changed.' });
    //   res.redirect('/account');
    // });
  } catch (err) {
    next(err);
  }
};


/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = async (req, res, next) => {
  try {
    await User.deleteOne({ email: req.user.email});
    req.logout((err) => {
      if (err) console.log('Error: Failed to logout.', err);
      req.session.destroy((err) => {
        if (err) console.log('Error: Failed to destroy the session during account deletion.', err);
        req.user = null;
        res.redirect('/');
      });
    });
  } catch (err) {
    next(err);
  }
};

// exports.postDeleteAccount = async (req, res, next) => {
//   try {
//     // Find the user by ID and delete it
//     const deletedUser = await User.findOneAndDelete({ _id: req.user.id });

//     if (!deletedUser) {
//       // Handle the case where the user is not found
//       req.flash('errors', { msg: 'User not found' });
//       return res.redirect('/');
//     }

//     // Logout the user and destroy the session
//     req.logout((err) => {
//       if (err) {
//         console.error('Error: Failed to logout.', err);
//         return next(err);
//       }

//       req.session.destroy((err) => {
//         if (err) {
//           console.error('Error: Failed to destroy the session during account deletion.', err);
//           return next(err);
//         }
        
//         // Set the user to null and redirect to the homepage
//         req.user = null;
//         res.redirect('/');
//       });
//     });
//   } catch (err) {
//     next(err);
//   }
// };


/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = async (req, res, next) => {
  try {
    console.log("In getOauthUnlink******************************");
    // console.log("Request: " + req);
    // console.log("logged in users email: " + req.user.email);

    // remove the token from the user in the database
    let { provider } = req.params;
    provider = validator.escape(provider);
    const user = await User.findOne({ email: req.user.email });
    // console.log("User: " + user);
    // user[provider.toLowerCase()] = undefined;
    const tokensWithoutProviderToUnlink = user.tokens.filter((token) =>
      token.kind.toLowerCase() !== provider.toLowerCase());
    // console.log("Before: " + user.tokens);
    // console.log("----tokensWithoutProviderToUnlink: " + tokensWithoutProviderToUnlink)

    // Some auth providers do not provide an email address in the user profile.
    // As a result, we need to verify that unlinking the provider is safe by ensuring
    // that another login method exists.
    if (
      !(user.email && user.password)
      && tokensWithoutProviderToUnlink.length === 0
    ) {
      req.flash('errors', {
        msg: `The ${_.startCase(_.toLower(provider))} account cannot be unlinked without another form of login enabled.`
        + ' Please link another account or add an email address and password.'
      });
      return res.redirect('/account');
    }

    // now remove the provider from the user in the database
    if(provider === 'google' && user.google) {
      // remove the google field from the user document
      await User.updateOne(
        { email: req.user.email },
        { $unset: { google: 1 } }
      );
    }

    user.tokens = tokensWithoutProviderToUnlink;
    await user.save();

    // update the user in the session. Then flash message / redirect


    req.flash('info', {
      msg: `${_.startCase(_.toLower(provider))} account has been unlinked.`,
    });

    // res.redirect('/account');
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/account');
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    const validationErrors = [];
    if (!validator.isHexadecimal(req.params.token)) validationErrors.push({ msg: 'Invalid Token.  Please retry.' });
    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('/forgot');
    }

    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec();
    if (!user) {
      req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
      return res.redirect('/forgot');
    }
    res.render('account/reset', {
      title: 'Password Reset'
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /account/verify/:token
 * Verify email address
 */
exports.getVerifyEmailToken = (req, res, next) => {
  if (req.user.emailVerified) {
    req.flash('info', { msg: 'The email address has been verified.' });
    return res.redirect('/account');
  }

  const validationErrors = [];
  if (validator.escape(req.params.token) && (!validator.isHexadecimal(req.params.token))) validationErrors.push({ msg: 'Invalid Token.  Please retry.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/account');
  }

  if (req.params.token === req.user.emailVerificationToken) {
    User
      .findOne({ email: req.user.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'There was an error in loading your profile.' });
          return res.redirect('back');
        }
        user.emailVerificationToken = '';
        user.emailVerified = true;
        user = user.save();
        req.flash('info', { msg: 'Thank you for verifying your email address.' });
        return res.redirect('/account');
      })
      .catch((error) => {
        console.log('Error saving the user profile to the database after email verification', error);
        req.flash('errors', { msg: 'There was an error when updating your profile.  Please try again later.' });
        return res.redirect('/account');
      });
  } else {
    req.flash('errors', { msg: 'The verification link was invalid, or is for a different account.' });
    return res.redirect('/account');
  }
};

/**
 * GET /account/verify
 * Verify email address
 */
exports.getVerifyEmail = (req, res, next) => {
  if (req.user.emailVerified) {
    req.flash('info', { msg: 'The email address has been verified.' });
    return res.redirect('/account');
  }

  if (!mailChecker.isValid(req.user.email)) {
    req.flash('errors', { msg: 'The email address is invalid or disposable and can not be verified.  Please update your email address and try again.' });
    return res.redirect('/account');
  }

  const createRandomToken = randomBytesAsync(16)
    .then((buf) => buf.toString('hex'));

  const setRandomToken = (token) => {
    User
      .findOne({ email: req.user.email })
      .then((user) => {
        user.emailVerificationToken = token;
        user = user.save();
      });
    return token;
  };

  const sendVerifyEmail = (token) => {
    const mailOptions = {
      to: req.user.email,
      from: process.env.SITE_CONTACT_EMAIL,
      subject: 'Please verify your email address on Hackathon Starter',
      text: `Thank you for registering with hackathon-starter.\n\n
        This verify your email address please click on the following link, or paste this into your browser:\n\n
        http://${req.headers.host}/account/verify/${token}\n\n
        \n\n
        Thank you!`
    };
    const mailSettings = {
      successfulType: 'info',
      successfulMsg: `An e-mail has been sent to ${req.user.email} with further instructions.`,
      loggingError: 'ERROR: Could not send verifyEmail email after security downgrade.\n',
      errorType: 'errors',
      errorMsg: 'Error sending the email verification message. Please try again shortly.',
      mailOptions,
      req
    };
    return sendMail(mailSettings);
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendVerifyEmail)
    .then(() => res.redirect('/account'))
    .catch(next);
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
  if (validator.escape(req.body.password) !== validator.escape(req.body.confirm)) validationErrors.push({ msg: 'Passwords do not match' });
  if (!validator.isHexadecimal(req.params.token)) validationErrors.push({ msg: 'Invalid Token.  Please retry.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    const mailOptions = {
      to: user.email,
      from: process.env.SITE_CONTACT_EMAIL,
      subject: 'Your Hackathon Starter password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };
    const mailSettings = {
      successfulType: 'success',
      successfulMsg: 'Success! Your password has been changed.',
      loggingError: 'ERROR: Could not send password reset confirmation email after security downgrade.\n',
      errorType: 'warning',
      errorMsg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.',
      mailOptions,
      req
    };
    return sendMail(mailSettings);
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch((err) => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/forgot');
  }
  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

  const createRandomToken = randomBytesAsync(16)
    .then((buf) => buf.toString('hex'));

  const setRandomToken = (token) =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const mailOptions = {
      to: user.email,
      from: process.env.SITE_CONTACT_EMAIL,
      subject: 'Reset your password on Hackathon Starter',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    const mailSettings = {
      successfulType: 'info',
      successfulMsg: `An e-mail has been sent to ${user.email} with further instructions.`,
      loggingError: 'ERROR: Could not send forgot password email after security downgrade.\n',
      errorType: 'errors',
      errorMsg: 'Error sending the password reset message. Please try again shortly.',
      mailOptions,
      req
    };
    return sendMail(mailSettings);
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};

/**
 * POST /postModuleProgress
 * Post what page the user is on and their percent completion
 */
exports.postModuleProgress = async (req, res, next) => {
    try {
      console.log("IN postModuleProgress***************************");
        const moduleToUpdate = req.body.modID;
        const sectionToUpdate = req.body.currentSection;

        const existingUser = await User.findOne({ email: req.user.email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // existingUser.moduleProgress[moduleToUpdate].percent = req.body.percent;
        existingUser.moduleStatus[moduleToUpdate][sectionToUpdate] = req.body.percent;
        existingUser.moduleProgress[moduleToUpdate].link = req.body.link;

        await existingUser.save();

        // req.user.moduleProgress.identity.percent = req.body.percent;
        req.user.moduleStatus[moduleToUpdate][sectionToUpdate] = req.body.percent;
        req.user.moduleProgress.identity.link = req.body.link;

        req.session.passport.user = req.user;
        await req.session.save();

        res.status(200).json({ message: 'Progress updated successfully!' });
    } catch (err) {
        next(err);
    }
};


exports.postQuizScore = async (req, res, next) => {
  // console.log("In POST quiz score request body***********************hiii****");

  const { modID, scoreTotal, correctAnswers, selectedAnswer, questionScores, currentSection } = req.body;
  console.log("*************In POST quiz score request body***********************hiii****");

  console.log("Module ID: " + modID);
  console.log("Score Total: " + scoreTotal);
  console.log("Correct Answers: " + correctAnswers);
  console.log("Selected Answer: " + selectedAnswer);
  console.log("Question Scores: " + questionScores);
  // console.log("Next Link: " + nextLink);
  console.log("Current Section: " + currentSection);

  try {
    const existingUser = await User.findOne({
      email: req.user.email
    });

    if (existingUser) {
      // prequiz attempt data
      const attempt = {
        timestamp: new Date(),
        correctAnswers: correctAnswers,
        questionScores: questionScores,
        questionChoices: selectedAnswer,
      };

      let sectionAttempts = currentSection + "Attempts";

      // Add the prequiz attempt to the challengeAttempts/submod1Attempts/etc array
      existingUser.moduleProgress[modID][sectionAttempts].push(attempt);

      // let statusSection;
      // if(currentSection === "challenge") {
      //   statusSection = "challenge";
      // } else if(currentSection === "submodOne") {
      //   statusSection = "concepts";
      // } else if(currentSection === "submodTwo") {
      //   statusSection = "consequences";
      // } else if(currentSection === "submodThree") {
      //   statusSection = "techniques";
      // } else if(currentSection === "submodFour") {
      //   statusSection = "protection";
      // } else {
      //   statusSection = "evaluation";
      // }

      existingUser.moduleStatus[modID][currentSection] = 100;

      // save to mongodb database
      await existingUser.save();

      // Manually update the session data
      req.session.passport.user.moduleProgress[modID][sectionAttempts] = existingUser.moduleProgress[modID][sectionAttempts];
      req.session.passport.user.moduleStatus[modID][currentSection] = 100;
      
      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Quiz score updated successfully');
        // res.redirect(nextLink);
      });

      // Update the user in the session - need to do this so can return to quiz results page in same session
      // req.login(existingUser, (err) => {
      //   if (err) {
      //     return next(err);
      //   }

      //   return res.redirect(nextLink);
      // });
    } else {
      res.status(404).send('User not found while posting quiz score');
    }

  } catch (err) {
    next(err);
  }
};

// get the latest quiz attempt
exports.getLatestQuizScore = async (req, res, next) => {
  const { modID, currentSection } = req.query;

  console.log("In GET latest quiz score request body***********************hiii****");
  console.log("Module ID: " + modID);
  console.log("Current Section: " + currentSection);

  try {
    const existingUser = await User.findOne({
      email: req.user.email
    });

    if (existingUser) {
      let sectionAttempts = currentSection + "Attempts";

      console.log("Section Attempts: " + sectionAttempts);
      
      let quizAttempts = existingUser.moduleProgress[modID][sectionAttempts];

      // Send the latest quiz attempt 
      res.status(200).json(quizAttempts.length > 0 ? quizAttempts[quizAttempts.length - 1] : []);

      // send all quiz attempts
      // res.status(200).json(quizAttempts);
    } else {
      res.status(404).send('User not found while retrieving quiz score');
    }
  } catch (err) {
    next(err);
  }
};

// get narration settings
exports.getNarrationSettings = async (req, res, next) => {
  // const { modID, currentSection } = req.query;

  console.log("In GET narration settings request body***********************hiii****");
  // console.log("Module ID: " + modID);
  // console.log("Current Section: " + currentSection);

  try {
    const existingUser = await User.findOne({
      email: req.user.email
    });

    if (existingUser) {      
      let narrationSettings = existingUser.narration;

      // Send the latest quiz attempt 
      res.status(200).json(narrationSettings);

      // send all quiz attempts
      // res.status(200).json(quizAttempts);
    } else {
      res.status(404).send('User not found while retrieving narration settings');
    }
  } catch (err) {
    next(err);
  }
};

exports.postRolePlay = async (req, res, next) => {
  const { role } = req.body;
  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's avatar
      existingUser.rolePlay = role;

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      req.session.passport.user.rolePlay = role;
      
      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Role updated successfully');
      });

      // Update the user in the session
      // req.login(existingUser, (err) => {
      //   if (err) {
      //     return next(err);
      //   }
  
      //   // Redirect or send a success response
      //   res.status(200).send('Avatar updated successfully');
      // });
    } else {
      res.status(404).send('User not found while updating role');
    }
  } catch (err) {
    next(err);
  }
};


exports.postAvatar = async (req, res, next) => {
  const { avatar, avatarImg } = req.body;

  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's avatar
      existingUser.avatar = avatar;
      existingUser.avatarImg = avatarImg;

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      req.session.passport.user.avatar = avatar;
      req.session.passport.user.avatarImg = avatarImg;
      
      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Avatar updated successfully');
      });

      // Update the user in the session
      // req.login(existingUser, (err) => {
      //   if (err) {
      //     return next(err);
      //   }
  
      //   // Redirect or send a success response
      //   res.status(200).send('Avatar updated successfully');
      // });
    } else {
      res.status(404).send('User not found while updating avatar');
    }
  } catch (err) {
    next(err);
  }
};

exports.postSpeed = async (req, res, next) => {
  const {speed} = req.body;

  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's avatar
      existingUser.narration.speed = speed;

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      req.session.passport.user.narration.speed = speed;

      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Narration speed updated successfully');
      });
    } else {
      res.status(404).send('User not found while updating narration speed');
    }
  } catch (err) {
    next(err);
  }
};

exports.postMute = async (req, res, next) => {
  const {mute} = req.body;

  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's avatar
      existingUser.narration.mute = mute;

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      req.session.passport.user.narration.mute = mute;

      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Narration mute updated successfully');
      });
    } else {
      res.status(404).send('User not found while updating narration mute');
    }
  } catch (err) {
    next(err);
  }
};

exports.postWordHighlighting = async (req, res, next) => {
  const {wordHighlighting} = req.body;

  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's avatar
      existingUser.narration.wordHighlighting = wordHighlighting;

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      req.session.passport.user.narration.wordHighlighting = wordHighlighting;

      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Narration wordHighlighting updated successfully');
      });
    } else {
      res.status(404).send('User not found while updating narration wordHighlighting');
    }
  } catch (err) {
    next(err);
  }
};

exports.postSentenceHighlighting = async (req, res, next) => {
  const {sentenceHighlighting} = req.body;

  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's avatar
      existingUser.narration.sentenceHighlighting = sentenceHighlighting;

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      req.session.passport.user.narration.sentenceHighlighting = sentenceHighlighting;

      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).send('Narration sentenceHighlighting updated successfully');
      });
    } else {
      res.status(404).send('User not found while updating narration sentenceHighlighting');
    }
  } catch (err) {
    next(err);
  }
};

exports.updateNarrationSettings = async (req, res, next) => {
  const { type, value } = req.body;
  console.log("*** in updateNarrationSettings, the passed ing params: ", type, value);

  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Update the user's narration settings
      // existingUser.narration.speed = speed;
      if (type === 'word') {
          existingUser.narration.wordHighlighting = value;
          // console.log("NOw the word highlighting in db is: ", existingUser.wordHighlighting)
      } else if (type === 'sentence') {
          existingUser.narration.sentenceHighlighting = value;
          // console.log("NOw the sentence highlighting in db is: ", existingUser.sentenceHighlighting)
      } else if(type === 'mute') {
          existingUser.narration.mute = value;
      } else if(type === "speed"){
          existingUser.narration.speed = value;
      } else {
          return res.status(400).json({ error: 'Invalid type' });
      }

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      if (req.session.passport && req.session.passport.user) {
        if(type === 'word') {
          req.session.passport.user.narration.wordHighlighting = value;
        } else if(type === 'sentence') {
          req.session.passport.user.narration.sentenceHighlighting = value;
        } else if(type === 'mute') {
          req.session.passport.user.narration.mute = value;
        } else if(type === 'speed') {
          req.session.passport.user.narration.speed = value;
        }
      } else {
        return res.status(404).json({ error: 'User not found in the session' });
      }

      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        res.status(200).json({ message: 'Narration setting updated successfully' });
      });
    } else {
      res.status(404).json({ error: 'User not found while updating narration setting' });
    }
  } catch (err) {
    next(err);
  }
};

exports.postPracticeChoice = async (req, res, next) => {
  // const { point, choice } = req.body;
  // const moduleToUpdate = req.body.modID;
  const {questionNum, choice, moduleToUpdate} = req.body;
  console.log("^^Backkend IN POST PRACTICE CHOICE***************************");
  console.log("Question Number: " + questionNum);
  console.log("Choice: " + choice);
  console.log("Module to Update: " + moduleToUpdate);


  console.log("YOU ARE IN POST PRACTICE CHOICE***************************");
  try {
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Post user's choice

      if(questionNum === "reset") {
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice1 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice2 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice3 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice4 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice5 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice6 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.choice7 = "none";
        existingUser.moduleProgress[moduleToUpdate].practiceChoices.score = 0;
      } else {
        existingUser.moduleProgress[moduleToUpdate].practiceChoices[questionNum] = choice;  
      }

      // Save to MongoDB database
      await existingUser.save();

      // Manually update the user object in the session
      if(questionNum === "reset") {
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice1 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice2 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice3 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice4 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice5 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice6 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.choice7 = "none";
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices.score = 0;
      } else {
        req.session.passport.user.moduleProgress[moduleToUpdate].practiceChoices[questionNum] = choice;
      }
      // Save the session
      req.session.save((err) => {
        if (err) {
          return next(err);
        }

        // Redirect or send a success response
        // res.status(200).send('Practice choice updated successfully');
        if(questionNum === "choice7") {
          res.status(200).json({ 
              message: 'Practice choice updated successfully!',
              updatedChoices: existingUser.moduleProgress[moduleToUpdate].practiceChoices
          });
        } else {
          res.status(200).send('Practice choice updated successfully');
        }
      });

    } else {
      res.status(404).send('User not found while trying to post practice choice');
    }
  } catch (err) {
    next(err);
  }
};

exports.getPracticeChoices = async (req, res, next) => {
  console.log("Hiiii  In GET practice choices***************************");
  try {
    // Find the user by email
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Extract practice choice information
      const practiceChoices = existingUser.moduleProgress.romance.practiceChoices;

      // Send the practice choice information as a response
      res.status(200).json(practiceChoices);
    } else {
      // If user not found, send a 404 response
      res.status(404).send('User not found');
    }
  } catch (err) {
    // If an error occurs, pass it to the error handling middleware
    next(err);
  }
};

/**
 * POST /postStartTime
 * Post time that user opened the page
 */
exports.postStartTime = async (req, res, next) => {
    try {
        const { modID, page } = req.body;
        // console.log("In backend POST start time request body***************************");
        // console.log("Module ID: " + modID);
        // console.log("The Page Name: " + page);
        const existingUser = await User.findOne({ email: req.user.email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const pageTime = {
            page: page,
            startTime: Date.now(),
            endTime: null,
            duration: null,
        };

        const pageID = page + "_Times";

        existingUser.modulePageAccessLog.push(page);
        existingUser.modulePageTimes[modID][pageID].push(pageTime);

        await existingUser.save();

        req.user.modulePageTimes[modID][pageID].push(pageTime);
        req.session.passport.user = req.user;

        await req.session.save();

        res.status(200).json({ message: 'Progress updated successfully!' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /postEndTime
 * Post time that user closed the page
 */
exports.postEndTime = async (req, res, next) => {
    console.log("In user.js POST end time***************************");
    try {
        const { modID, page } = req.body;
        const existingUser = await User.findOne({ email: req.user.email });

        if (existingUser) {
            const pageID = page + "_Times";
            const pageTimes = existingUser.modulePageTimes[modID][pageID];
            const indexToUpdate = pageTimes.length - 1;

            const endTime = Date.now();
            const durationInMillis = endTime - pageTimes[indexToUpdate].startTime;

            pageTimes[indexToUpdate].endTime = endTime;
            pageTimes[indexToUpdate].durationMilliseconds = durationInMillis;
            pageTimes[indexToUpdate].durationFormatted = formatDuration(durationInMillis);

            await existingUser.save();
        }

        res.status(200).json({ message: "End time updated successfully." });
    } catch (err) {
        next(err);
    }
};



// Format duration milli second to HH:MM:SS
function formatDuration(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return formattedDuration;
}




// guests
exports.postGuestLogin = (req, res, next) => {
  passport.authenticate(['basic', 'anonymous'], { session: false }),
  function(req, res) {
    let user = "";
    if (req.user) {
      user = req.user.email
      //res.json({ name: req.user.username });
    } else {
      user = 'anonymous'
      //res.json({ name: 'anonymous' });
    }
  };
};


exports.getGuest = async (req, res, next) => {
  try {
      if (req.params.modId === "delete") {
          // avoiding a specific user behavior that causes 500 errors
          return res.send({
              result: "failure"
          });
      }

      const user = new User({
          password: "thinkblue",
          name: "guest" + makeid(10),
          email: makeid(10) + "@gmail.com",
          isGuest: true,
          lastNotifyVisit: Date.now()
      });

      user.name = "Guest";

      const existingUser = await User.findOne({ name: req.body.name });

      if (existingUser) {
          req.flash('errors', { msg: 'Error: Account with that guest name already exists.' });
          return res.redirect('/');
      }

      await user.save();

      // Use the custom login function from passport to log in the user
      req.logIn(user, async (err) => {
          if (err) {
              return next(err);
          }
          const temp = req.session.passport;

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

          return res.redirect('/selection');
      });
  } catch (err) {
      return next(err);
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



/**
 * POST /postBadge
 * Put badges into DB 
 * 
 */
exports.postBadge = async (req, res, next) => {
  
  // Extract what was sent over from the front end POST request (postBadge.js)
  const badge_module = req.body.module;
  const badge_section = req.body.section;
  const badge_type = req.body.type;
  const badge_name = req.body.name;
  const badge_url = req.body.imageUrl;

  try {
    // Find an existing user 
    const existingUser = await User.findOne({ email: req.user.email });

    if (existingUser) {
      // Check if the badge with the same properties already exists
      const duplicateBadge = existingUser.badges.find(badge => 
        badge.module === badge_module &&
        badge.section === badge_section &&
        badge.type === badge_type &&
        badge.name === badge_name &&
        badge.imageUrl === badge_url
      );

      if (!duplicateBadge) {
        // Add the new badge to the array
        const newBadge = {
          module: badge_module, // Assuming badge_module is defined somewhere in your code
          section: badge_section,
          type: badge_type,
          name: badge_name,
          imageUrl: badge_url
        };

        existingUser.badges.push(newBadge);

        // Save to the MongoDB database
        await existingUser.save();

        // Manually update the session data
        req.session.passport.user.badges = existingUser.badges;

        // Save the session
        req.session.save((err) => {
          if (err) {
            return next(err);
          }
        });

        // Send an OK response back to the front end 
        res.status(200).json({ message: "Badge updated successfully." });
      } else {
        // Send a response indicating that the badge already exists
        res.status(200).json({ message: "Badge already earned. Not adding." });
      }
    } else {
      // Send a 404 response back to the front end if the user is not found
      res.status(404).send('User not found while updating badge');
    }

  } catch (err) {
    next(err);
  }
};

/**
 * GET /getBadges
 */
exports.getBadges = async (req, res, next) => {
  console.log("get badges back end"); 
  // We need to find an existing user 
  try {
    const existingUser = await User.findOne({
      email: req.user.email
    });

    if (existingUser) {
      // console.log("the badges are " + JSON.stringify(existingUser.badges));

      // Send back the badges of the existing user
      res.status(200).json(existingUser.badges);
    } else {
      // Send a 404 response back to the front end if this fails
      res.status(404).send('User not found while fetching badges');
    }

  } catch (err) {
    next(err);
  }
};