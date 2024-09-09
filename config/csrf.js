// import { doubleCsrf } from 'csrf-csrf';

// // Create CSRF protection and token generation utilities
// const { generateToken, doubleCsrfProtection } = doubleCsrf({
//     getSecret: () => process.env.CSRF_SECRET || 'defaultSecret',  // Secret to sign CSRF tokens
//     cookieName: 'csrf-token',     // Name of the CSRF cookie
//     cookieOptions: {              // Options for the CSRF cookie
//       httpOnly: true,             // Prevent JavaScript access to the cookie
//       sameSite: 'Lax',            // Controls cross-site behavior (use Strict or Lax)
//       secure: false,              // Set true in production (HTTPS required)
//     },
//     getTokenFromRequest: (req) => req.headers['x-csrf-token'],  // Extract CSRF token from header
// });

// // Export the necessary utilities for CSRF handling
// export { generateToken, doubleCsrfProtection };
