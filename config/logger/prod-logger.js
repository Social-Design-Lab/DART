require('dotenv').config();

const { json } = require('body-parser');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors } = format;

function buildProdLogger() {
    return createLogger({
        level: process.env.LOG_LEVEL, // the levels are: error, warn, info, http, verbose, debug, silly
        format: combine(
            timestamp(),
            errors({ stack: true }),
            format.json()
        ),
        defaultMeta:({ service: 'user-service' }),
        transports: [new transports.Console()],

    });
}


module.exports = buildProdLogger;
