import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './config/logger/index.js';
import morgan from 'morgan';

import db from './config/database.js';

// For Node.js 20.2 and later we need to explicitly set __dirname and __filename
const __dirname = import.meta.dirname;

// Test the connection
db.authenticate()
  .then(() => logger.info('Database connected...'))
  .catch(err => logger.error('Error: ' + err));

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Use Morgan for HTTP request logging, with logs sent to Winston
// app.use(morgan('combined', { stream: logger.stream }));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg) } }));




app.get('/', (req, res) => {
    logger.info('Home page accessed');  // Log when the home page is accessed
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
