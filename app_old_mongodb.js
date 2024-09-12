/**
 * Module dependencies.
 */
const path = require("path");
const express = require("express");
const compression = require("compression");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const errorHandler = require("errorhandler");
const lusca = require("lusca");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo");
const flash = require("express-flash");
const mongoose = require("mongoose");
const passport = require("passport");
const lessonRoutes = require('./routes/lesson.routes');

// const multer = require('multer');

// const upload = multer({ dest: path.join(__dirname, 'uploads') });

// for json file reading
const fs = require("fs");
const util = require("util");
const cookieSession = require("cookie-session");
fs.readFileAsync = util.promisify(fs.readFile);

const nocache = require('nocache');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

// is this needed?
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

/**
 * Set config values
 */
const secureTransfer = process.env.BASE_URL.startsWith("https");

// This logic for numberOfProxies works for local testing, ngrok use, single host deployments
// behind cloudflare, etc. You may need to change it for more complex network settings.
// See readme.md for more info.
let numberOfProxies;
if (secureTransfer) numberOfProxies = 1;
else numberOfProxies = 0;

/**
 * Controllers (route handlers).
 */
const homeController = require("./controllers/home");
const moduleController = require("./controllers/modules");
const coursesController = require("./controllers/courses");
const userController = require("./controllers/userController");
const contactController = require("./controllers/contact");
const newapiController = require("./controllers/newsapi");


/**
 * API keys and Passport configuration.
 */
const passportConfig = require("./config/passport");

/**
 * Create Express server.
 */
const app = express();
console.log(
  'Run this app using "npm start" to include sass/scss/css builds.\n'
);

// Use the nocache middleware to disable caching for testing so don't have to hard reload clear cache everytime
app.use(nocache());

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running."
  );
  process.exit();
});

/**
 * Express configuration.
 */
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("trust proxy", numberOfProxies);
app.use('/api', lessonRoutes);
app.use(flash());
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    name: "startercookie", // change the cookie name for additional security in production
    cookie: {
      maxAge: 1209600000, // Two weeks in milliseconds
      secure: secureTransfer,
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)
  ) {
    req.session.returnTo = req.originalUrl;
  } else if (
    req.user &&
    (req.path === "/account" || req.path.match(/^\/api/))
  ) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);
app.use(
  "/profile_pictures",
  express.static(path.join(__dirname, "profile_pictures"), {
    maxAge: 31557600000,
  })
);

// app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/chart.js/dist"), {
    maxAge: 31557600000,
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/popper.js/dist/umd"), {
    maxAge: 31557600000,
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"), {
    maxAge: 31557600000,
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/jquery/dist"), {
    maxAge: 31557600000,
  })
);
app.use(
  "/webfonts",
  express.static(
    path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/webfonts"),
    { maxAge: 31557600000 }
  )
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
// app.get('/', (req, res, next) => {
//   if (req.isAuthenticated()) {
//     // If the user is authenticated, redirect to the '/courses' page
//     res.redirect('/courses');
//   } else {
//     // If not authenticated, continue to the homeController.index route
//     homeController.index(req, res, next);
//   }
// });
app.get("/courses", coursesController.index);
app.get("/about/:modId", isValidModId, moduleController.getAbout);
app.get("/references/:modId", isValidModId, moduleController.getReferences);
app.get("/course-player", moduleController.getModule);
app.post("/completeModuleStatus", moduleController.completeModuleStatus);
app.post("/getModuleStatus", moduleController.getModuleStatus);

app.get("/newsapi",newapiController.getNewsAPI)  

app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get(
  "/account/verify",
  passportConfig.isAuthenticated,
  userController.getVerifyEmail
);
app.get(
  "/account/verify/:token",
  passportConfig.isAuthenticated,
  userController.getVerifyEmailToken
);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post(
  "/account/profile",
  passportConfig.isAuthenticated,
  userController.postUpdateProfile
);
app.post(
  "/account/password",
  passportConfig.isAuthenticated,
  userController.postUpdatePassword
);
// app.post('/account/newsletter', passportConfig.isAuthenticated, userController.postUpdateNewsletter);
app.post(
  "/account/delete",
  passportConfig.isAuthenticated,
  userController.postDeleteAccount
);
app.get(
  "/account/unlink/:provider",
  passportConfig.isAuthenticated,
  userController.getOauthUnlink
);
app.post("/postBadge", userController.postBadge);
app.get("/getBadges", userController.getBadges);
app.post("/guestLogin", userController.postGuestLogin);
app.get("/getGuest", userController.getGuest);

//Route added by liv to take you to the tutorial
app.get("/tutorial", (req, res) => {
  res.render("tutorial");
});

//Route added by brandon for the mock profiles
app.get("/techniques", (req, res) => {
  res.render("techniques");
});

// Render privacy policy page.
app.get("/privacy", function (req, res) {
  res.render("privacy_policy", {
    title: "Privacy Policy",
  });
});

// Render terms and conditions page.
app.get("/terms", function (req, res) {
  res.render("terms", {
    title: "Terms",
  });
});

// Render cookie policy page.
app.get("/cookies", function (req, res) {
  res.render("cookies", {
    title: "Cookies",
  });
});

// Render selection
app.get("/selection", passportConfig.isAuthenticated, function (req, res) {
  res.render("account/selection", {
    title: "Selection",
  });
});

// Render character intro
app.get("/character", passportConfig.isAuthenticated, function (req, res) {
  res.render("account/character_intro", {
    title: "Hello",
  });
});

// Render accessibility page
app.get("/accessibility", passportConfig.isAuthenticated, function (req, res) {
  res.render("accessibility.pug", {
    title: "Accessibility",
  });
});

// Render dashboard
app.get("/dashboard", passportConfig.isAuthenticated, function (req, res) {
  res.render("dashboard", {
    title: "Dashboard",
  });
});

/**
 * Module Routes
 */
app.get("/intro/:page?/:modId", isValidModId, coursesController.getIntro);
app.get(
  "/challenge/:page?/:modId",
  isValidModId,
  coursesController.getChallenge
);
app.get(
  "/learn/:submod(submod|submod2|submod3)/:page?/:modId",
  isValidModId,
  coursesController.getLearn
);
app.get("/explore/:page?/:modId", isValidModId, coursesController.getExplore);
app.get(
  "/evaluation/:page?/:modId",
  isValidModId,
  coursesController.getEvaluation
);
app.get("/reflect/:page?/:modId", isValidModId, coursesController.getReflect);
app.get("/certificate/:modId", isValidModId, coursesController.getCertificate);

// for module progress and timing
app.post("/postStartTime", userController.postStartTime);
app.post("/postEndTime", userController.postEndTime);
app.post("/postModuleProgress", userController.postModuleProgress);
app.post("/postQuizScore", userController.postQuizScore);
app.get("/getLatestQuizScore", userController.getLatestQuizScore);
app.get("/getNarrationSettings", userController.getNarrationSettings);
app.post("/updateNarrationSettings", userController.updateNarrationSettings);
app.post("/postAvatar", userController.postAvatar);
app.post("/postRolePlay", userController.postRolePlay);
app.post("/postPracticeChoice", userController.postPracticeChoice);
app.post("/getPracticeChoices", userController.getPracticeChoices);

function isValidModId(req, res, next) {
  const modIds = ["identity", "romance", "grandparent", "tech"];
  if (modIds.includes(req.params.modId)) {
    next();
  } else {
    var err = new Error("Page Not Found.");
    err.status = 404;

    console.log(err);

    // set locals, only providing error stack in development
    err.stack = req.app.get("env") === "development" ? err.stack : "";

    res.locals.message =
      err.message + " Oops! We can't seem to find the page you're looking for.";
    res.locals.error = err;

    // render the error page
    res.status(err.status);
    res.render("error");
  }
}

/**
 * API examples routes.
 */
// app.get('/api', apiController.getApi);
// app.get('/api/stripe', apiController.getStripe);
// app.post('/api/stripe', apiController.postStripe);
// app.get('/api/scraping', apiController.getScraping);
// app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
// app.get('/api/paypal', apiController.getPayPal);
// app.get('/api/paypal/success', apiController.getPayPalSuccess);
// app.get('/api/paypal/cancel', apiController.getPayPalCancel);
// app.get('/api/upload', lusca({ csrf: true }), apiController.getFileUpload);
// app.post('/api/upload', upload.single('myFile'), lusca({ csrf: true }), apiController.postFileUpload);
// app.get('/api/google-maps', apiController.getGoogleMaps);
// app.get('/api/google/drive', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleDrive);
// app.get('/api/chart', apiController.getChart);
// app.get('/api/google/sheets', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleSheets);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(req.session.returnTo || "/");
  }
);
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(req.session.returnTo || "/");
  }
);

// app.get('/auth/twitter', passport.authenticate('twitter'));
// app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });

/**
 * OAuth authorization routes. (API examples)
 */
// app.get('/auth/foursquare', passport.authorize('foursquare'));
// app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
//   res.redirect('/api/foursquare');
// });
// app.get('/auth/tumblr', passport.authorize('tumblr'));
// app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
//   res.redirect('/api/tumblr');
// });
// app.get('/auth/steam', passport.authorize('steam-openid', { state: 'SOME STATE' }));
// app.get('/auth/steam/callback', passport.authorize('steam-openid', { failureRedirect: '/api' }), (req, res) => {
//   res.redirect(req.session.returnTo);
// });
// app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
// app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect('/api/pinterest');
// });
// app.get('/auth/quickbooks', passport.authorize('quickbooks', { scope: ['com.intuit.quickbooks.accounting'], state: 'SOME STATE' }));
// app.get('/auth/quickbooks/callback', passport.authorize('quickbooks', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo);
// });

/**
 * Error Handler.
 */
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  res.status(404).send("Page Not Found");
});

if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  const { BASE_URL } = process.env;
  const colonIndex = BASE_URL.lastIndexOf(":");
  const port = parseInt(BASE_URL.slice(colonIndex + 1), 10);

  if (!BASE_URL.startsWith("http://localhost")) {
    console.log(
      `The BASE_URL env variable is set to ${BASE_URL}. If you directly test the application through http://localhost:${app.get(
        "port"
      )} instead of the BASE_URL, it may cause a CSRF mismatch or an Oauth authentication failur. To avoid the issues, change the BASE_URL or configure your proxy to match it.\n`
    );
  } else if (app.get("port") !== port) {
    console.warn(
      `WARNING: The BASE_URL environment variable and the App have a port mismatch. If you plan to view the app in your browser using the localhost address, you may need to adjust one of the ports to make them match. BASE_URL: ${BASE_URL}\n`
    );
  }

  console.log(
    `App is running on http://localhost:${app.get("port")} in ${app.get(
      "env"
    )} mode.`
  );
  console.log("Press CTRL-C to stop.");
});

module.exports = app;
