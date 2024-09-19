import buildDevLogger from './dev-logger.js';
import buildProdLogger from './prod-logger.js';

let logger;
if (process.env.NODE_ENV === 'development') {
    logger = buildDevLogger();
    logger.info('Logging initialized in development mode');
} else {
    logger = buildProdLogger();
    logger.info('Logging initialized in production mode');
}

export default logger;
