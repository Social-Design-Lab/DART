import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './config/logger/index.js';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport.js';
import flash from 'express-flash';
import compression from 'compression';
import lusca from 'lusca';
import SequelizeStore from 'connect-session-sequelize';
import db from './config/database.js';

// Import user routes from the controllers folder
import * as userController from './controllers/user.js';

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

const app = express();

// Express configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(compression());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

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
app.get('/auth/google', userController.googleAuth);
app.get('/auth/google/callback', userController.googleCallback);


// Error handler
// Error handler for 404 - Page Not Found
app.use((req, res, next) => {
    res.status(404);
    res.render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {},
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
