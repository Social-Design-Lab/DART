import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './config/logger/index.js';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport.js';
import { isAuthenticated, isAuthorized } from './config/passport.js';
import { generateToken, csrfSynchronisedProtection } from './config/csrf.js';
import errorHandler from 'errorhandler';
// import nocache from 'nocache';


import flash from 'express-flash';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from 'cors';



import SequelizeStore from 'connect-session-sequelize';
import db from './config/database.js';
// import passportConfig from './config/passport.js';
// import { isAuthenticated, isAuthorized } from './config/passport.js';

// Import user routes from the controllers folder
import * as userController from './controllers/userController.js';
import * as moduleController from './controllers/moduleController.js';
import * as courseController from './controllers/courseController.js';
import * as quizController from './controllers/quizController.js';

// import Courses from './sequelize/models/Course.js';


// For Node.js 20.2 and later we need to explicitly set __dirname and __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Sequelize session store
const SequelizeSessionStore = SequelizeStore(session.Store);
const sessionStore = new SequelizeSessionStore({
  db: db,
});

// Test the connection
db.authenticate()
  .then(() => logger.info('Database connected...'))
  .catch(err => logger.error('Error: ' + err));


try {
    // dont use in production, use migrations instead for version control and to avoid data loss
    await db.sync();
    console.log('Database & tables created!');
} catch (err) {
    console.error('Unable to sync the database:', err);
}

const app = express();

// Express configuration
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");



// Middleware
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(compression());
// app.use(lusca.xframe('SAMEORIGIN'));
// app.use(lusca.xssProtection(true));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1209600000, // Two weeks in milliseconds
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        httpOnly: true, // Prevent client-side JS access
        sameSite: 'strict', // Prevent CSRF attacks
      },
    })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Use Morgan for HTTP request logging, with logs sent to Winston
app.use(morgan('combined', { stream: { write: msg => logger.http(msg) } }));

// Sync the session store with the database
sessionStore.sync();

// ***Security stuff

// csrf-csrf configuation
// app.use(cookieParser());
// app.use(cookieParser(process.env.COOKIE_SECRET));
// const { generateToken, doubleCsrfProtection } = doubleCsrf({
//   getSecret: () => process.env.CSRF_SECRET || 'defaultSecret',  // Secret to sign CSRF tokens
//   cookieName: 'csrf-token',     // Name of the CSRF cookie
//   cookieOptions: {              // Options for the CSRF cookie
//     httpOnly: true,             // Prevent JavaScript access to the cookie
//     sameSite: 'Lax',            // Controls cross-site behavior (use Strict or Lax)
//     secure: false,              // Set true in production (HTTPS required)
//   },
//   getTokenFromRequest: (req) => req.headers['x-csrf-token'],  // Extract CSRF token from header
// });

// Route to provide CSRF token to the client. For when we need to dynamically request a CSRF token from the server without reloading the page (like during modules which are SPA single page apps).
// app.get('/csrf-token', (req, res) => {
//   const csrfToken = generateToken(req, res);
//   res.json({ csrfToken });
// });




// Hide "X-Powered-By" header to avoid revealing Express.js
// Prevents attackers from identifying the framework and targeting known vulnerabilities
app.disable("x-powered-by");

// Apply rate limiting to all requests (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);


const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
  'http://localhost:3000', 
  'https://dart.socialsandbox.xyz', 
  'https://dart-test.socialsandbox.xyz', 
  'https://dartacademy.net'
];

// Add CORS to secure cross-origin requests within our eLearning platform
// This ensures that only trusted domains can interact with our backend, enhancing security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin or from trusted origins in the environment variable
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Restrict allowed headers
  credentials: true, // Allow credentials such as cookies
}; 

app.use(cors(corsOptions));



// Apply CSRF protection
app.use(csrfSynchronisedProtection); 


// make user object available in all views
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



// Routes
app.get('/', (req, res) => {
    logger.info('Home page accessed');  
    res.render('home'); 
});




app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
// app.post("/guestLogin", userController.postGuestLogin);
app.get("/getGuest", userController.getGuest);
app.get('/logout', userController.logout);
app.get("/signup", userController.getSignup)
app.post("/signup", userController.postSignup);

// app.post("/signup", (req, res, next) => {
//   const tokenInBody = req.body._csrf;
//   const tokenInHeader = req.headers['x-csrf-token'];
  
//   logger.debug("***Token in Body: ", tokenInBody);
//   logger.debug("***Token in Header: ", tokenInHeader);
  
//   next();  // Proceed to doubleCsrfProtection middleware
// }, userController.postSignup);

// app.post("/signup", doubleCsrfProtection, userController.postSignup);
app.get('/auth/google', userController.googleAuth);
app.get('/auth/google/callback', userController.googleCallback);
app.post("/postAvatar", userController.postAvatar);


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
  app.get("/selection", isAuthenticated, function (req, res) {
    res.render("account/selection", {
      title: "Selection",
      csrfToken: req.csrfToken()
    });
  });
  
  // Render character intro
  app.get("/character", function (req, res) {
    res.render("account/character_intro", {
      title: "Hello",
    });
  });


  
  //  app.get("/courses", function (req, res) {
  //   res.render('courses', {
  //     title: 'Courses'
  //   });
  // });
  
  // Render accessibility page
  app.get("/accessibility", function (req, res) {
    res.render("accessibility.pug", {
      title: "Accessibility",
    });
  });
  
  // Render dashboard
  app.get("/dashboard", function (req, res) {
    res.render("dashboard", {
      title: "Dashboard",
    });
  });

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
  
    app.get("/courses", courseController.getCourses);
    app.get("/about/:modId", isValidModId, courseController.getAbout);


  app.get("/course-player", moduleController.getModule);
  app.get("/references/:modId", isValidModId, moduleController.getReferences);


  /**
   * Module Routes
   */
  app.get("/intro/:page?/:modId", isValidModId, courseController.getIntro);
  app.get(
    "/challenge/:page?/:modId",
    isValidModId,
    courseController.getChallenge
  );
  app.get(
    "/learn/:submod(submod|submod2|submod3)/:page?/:modId",
    isValidModId,
    courseController.getLearn
  );
  // Route to get the latest quiz score
  app.get("/getLatestQuizScore", quizController.getLatestQuizScore);

  // app.get("/explore/:page?/:modId", isValidModId, courseController.getExplore);
  // app.get(
  //   "/evaluation/:page?/:modId",
  //   isValidModId,
  //   courseController.getEvaluation
  // );
  // app.get("/reflect/:page?/:modId", isValidModId, courseController.getReflect);
  // app.get("/certificate/:modId", isValidModId, courseController.getCertificate);

// // Render selection
// app.get("/selection", function (req, res) {
//     res.render("account/selection", {
//         title: "Selection",
//     });
// });
  
// // Render character intro
// app.get("/character", passportConfig.isAuthenticated, function (req, res) {
//     res.render("account/character_intro", {
//         title: "Hello",
//     });
// });


// // Render selection
// app.get("/selection", function (req, res) {
//     res.render("account/selection", {
//         title: "Selection",
//     });
// });
  
// // Render character intro
// app.get("/character", passportConfig.isAuthenticated, function (req, res) {
//     res.render("account/character_intro", {
//         title: "Hello",
//     });
// });

// Error handler
// Error handler for 404 - Page Not Found
app.use((req, res, next) => {
    res.status(404);
    res.render('404', { title: 'Page Not Found' });
});

if (process.env.NODE_ENV === "development") {
    // Detailed error stack trace for development
    app.use(errorHandler());

    // disable caching in development
    // app.use(nocache());
}

// General error handler for all environments
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {},  // Show error details only in dev
        title: 'Server Error'
    });
});

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));


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
  