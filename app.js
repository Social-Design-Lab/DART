import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './config/logger/index.js';
import morgan from 'morgan';
import db from './config/database.js';

// Test the connection
db.authenticate()
  .then(() => logger.info('Database connected...'))
  .catch(err => logger.error('Error: ' + err));



const app = express();

app.get('/', (req, res) => {
    logger.info('Home page accessed');  // Log when the home page is accessed
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
