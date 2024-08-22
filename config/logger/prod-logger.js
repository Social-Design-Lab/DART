import 'dotenv/config';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, errors } = format;

function buildProdLogger() {
    return createLogger({
        level: process.env.LOG_LEVEL, // the levels are: error, warn, info, http, verbose, debug, silly
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

