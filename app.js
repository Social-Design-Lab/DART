import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './config/logger/index.js';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport.js';
import { isAuthenticated, isAuthorized } from './config/passport.js';
import errorHandler from 'errorhandler';


import flash from 'express-flash';
import compression from 'compression';
import lusca from 'lusca';
import SequelizeStore from 'connect-session-sequelize';
import db from './config/database.js';
// import passportConfig from './config/passport.js';
// import { isAuthenticated, isAuthorized } from './config/passport.js';

// Import user routes from the controllers folder
import * as userController from './controllers/userController.js';

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

// make user object available in all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Middleware
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(compression());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
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

// Routes
app.get('/', (req, res) => {
    logger.info('Home page accessed');  
    res.render('home'); 
});

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
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
    });
  });
  
  // Render character intro
  app.get("/character", function (req, res) {
    res.render("account/character_intro", {
      title: "Hello",
    });
  });
  
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
  