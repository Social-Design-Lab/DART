import 'dotenv/config';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize, errors } = format;

function buildDevLogger() {
    const logFormat = printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    });
    
    return createLogger({
        level: process.env.LOG_LEVEL, // the levels are: error, warn, info, http, verbose, debug, silly
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
        ),
        transports: [new transports.Console()],
    });
}

export default buildDevLogger;
