require('dotenv').config();

const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const logger = require('./config/logger');
const db = require('./config/database');



// logger.info('Starting server...', {meta1:'meta1'});
// logger.warn('This is a warning!');
// logger.error(new Error('This is an error!'));
// logger.debug('This is a debug message!');

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
