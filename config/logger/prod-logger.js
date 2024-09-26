import 'dotenv/config';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, errors } = format;

const customLevels = {
    levels: {
        error: 0,           // Critical errors
        warn: 1,            // Warnings for potential issues
        security: 2,        // Security-related logs (e.g., failed logins)
        http: 3,            // HTTP request/response logs
        info: 4,            // General application info
        database: 5,        // Database-related logs
        action: 6,          // User actions (login, register, etc.)
        progress: 7,        // Course/lesson progress tracking
        quiz: 8,            // Quiz-related logs
        notification: 9,   // Notification logs (emails, reminders)
        interaction: 10,    // User interactions (e.g., video plays)
        searchQueries: 11,  // Search input logs (queries)
        performance: 12,    // Performance metrics (e.g., response times)
        userInput: 13,       // User input logs (form submissions, queries)
        debug: 14,          // Debugging information (lower-priority)
        silly: 15,          // Least critical, verbose, or fun logs
    },
    colors: {
        error: 'bgRed underline',
        warn: 'yellow bold italic',
        security: 'brightRed underline',
        http: 'cyan',
        info: 'magenta',         
        database: 'green',
        action: 'brightCyan',
        progress: 'bgGreen',
        quiz: 'magenta',
        notification: 'brightCyan',
        interaction: 'brightWhite',
        searchQueries: 'green underline',
        performance: 'bgGrey',
        userInput: 'brightYellow',
        debug: 'italic blue',
        silly: 'rainbow',
    }
};

// Apply custom colors
import { addColors } from 'winston';
addColors(customLevels.colors);


function buildProdLogger() {
    return createLogger({
        levels: customLevels.levels, 
        level: process.env.LOG_LEVEL || 'performance', 
        format: combine(
            timestamp(),
            errors({ stack: true }),
            format.json()
        ),
        defaultMeta: { service: 'user-service' },
        transports: [new transports.Console()],
    });
}

export default buildProdLogger;

