import { csrfSync } from 'csrf-sync';
import logger from './logger/index.js'; // Assuming you're using Winston or another logger

const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromState: (req) => {
    const token = req.session.csrfToken;
    logger.debug(`CSRF token from session: ${token}`); 
    return token;
  },
  getTokenFromRequest: (req) => {
    // Check for token in the body first, then fall back to headers
    const token = req.body._csrf || req.headers['csrf-token'];
    logger.debug(`CSRF token from request: ${token}`); 
    return token;
  },
  storeTokenInState: (req, token) => {
    req.session.csrfToken = token;
    logger.debug(`Storing CSRF token in session: ${token}`); 
  }
});

export { csrfSynchronisedProtection, generateToken };
