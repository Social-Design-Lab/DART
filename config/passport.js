import passport from 'passport';
import refresh from 'passport-oauth2-refresh';
import { Strategy as LocalStrategy } from 'passport-local';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { OAuthStrategy, OAuth2Strategy } from 'passport-oauth';
import moment from 'moment';
import User from '../sequelize/models/users.js'; // Adjust the import path as needed

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    return done(null, await User.findByPk(id)); // Sequelize method for primary key lookup
  } catch (error) {
    return done(error);
  }
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    if (!user.password) {
      return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
    }
    const isMatch = await user.comparePassword(password); // Ensure this method is defined in your Sequelize model
    if (isMatch) {
      return done(null, user);
    }
    return done(null, false, { msg: 'Invalid email or password.' });
  } catch (err) {
    return done(err);
  }
}));

/**
 * Sign in with Google.
 */
const googleStrategyConfig = new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, async (req, accessToken, refreshToken, params, profile, done) => {
  try {
    const loginUserAndUpdateSession = async (user) => {
      req.login(user, (err) => {
        if (err) {
          return done(err);
        }
        return done(null, user);
      });
    };

    if (req.user) {
      const existingGoogleUser = await User.findOne({ where: { google: profile.id } });
      if (existingGoogleUser && (existingGoogleUser.id !== req.user.id)) {
        req.flash('errors', { msg: 'This google email is not linked to an account.' });
        return done(null, existingGoogleUser);
      }
      const user = await User.findOne({ where: { email: req.user.email } });
      user.google = profile.id;
      user.tokens.push({
        kind: 'google',
        accessToken,
        accessTokenExpires: moment().add(params.expires_in, 'seconds').format(),
        refreshToken,
      });
      user.name = user.name || profile.name.givenName;
      await user.save();
      req.flash('info', { msg: 'Google account has been linked.' });
      return loginUserAndUpdateSession(user);
    }

    let user = await User.findOne({ where: { google: profile.id } });
    if (!user) {
      user = await User.findOne({ where: { email: profile.emails[0].value } });
    }

    if (user) {
      if (user.google === profile.id) {
        return done(null, user);
      } else if (user.email === profile.emails[0].value && !user.google) {
        req.flash('errors', { msg: 'Your account was registered using email and password. To enable Google login, sign in with that account then navigate to the profile page and press the "Link your Google Account" button.' });
        return done(null, false);
      }
    } else {
      user = await User.create({
        email: profile.emails[0].value,
        google: profile.id,
        tokens: [{
          kind: 'google',
          accessToken,
          accessTokenExpires: moment().add(params.expires_in, 'seconds').format(),
          refreshToken,
        }],
        name: profile.name.givenName
      });
      return loginUserAndUpdateSession(user);
    }
  } catch (err) {
    return done(err);
  }
});

passport.use('google', googleStrategyConfig);
refresh.use('google', googleStrategyConfig);

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

export const isAuthorized = async (req, res, next) => {
  const provider = req.path.split('/')[2];
  const token = req.user.tokens.find((token) => token.kind === provider);
  if (token) {
    if (token.accessTokenExpires && moment(token.accessTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
      if (token.refreshToken) {
        if (token.refreshTokenExpires && moment(token.refreshTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
          return req.session.save(() => res.redirect(`/auth/${provider}`));
        }
        try {
          const newTokens = await new Promise((resolve, reject) => {
            refresh.requestNewAccessToken(`${provider}`, token.refreshToken, (err, accessToken, refreshToken, params) => {
              if (err) reject(err);
              resolve({ accessToken, refreshToken, params });
            });
          });
          req.user.tokens.forEach((tokenObject) => {
            if (tokenObject.kind === provider) {
              tokenObject.accessToken = newTokens.accessToken;
              if (newTokens.params.expires_in) tokenObject.accessTokenExpires = moment().add(newTokens.params.expires_in, 'seconds').format();
            }
          });
          await req.user.save();
          return next();
        } catch (err) {
          logger.error('Token refresh error:', err);  // Use logger for error tracking
          return next();
        }
      } else {
        return req.session.save(() => res.redirect(`/auth/${provider}`));
      }
    } else {
      return next();
    }
  } else {
    return req.session.save(() => res.redirect(`/auth/${provider}`));
  }
};

export default passport;
