import * as winston from 'winston';
import { LoggingWinston} from "@google-cloud/logging-winston";
import { myVariables } from "./myVariables";
import * as sentry from '@sentry/node';

const loggingWinston = new LoggingWinston();
// Initialize Sentry.IO Exeception Logging
sentry.init({ dsn: myVariables.SENTRY_DSN });

// Initialize Google Stackdriver Logginer
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
        // Add Stackdriver Logging
        loggingWinston,
    ],
});

export function logIt(logType: string, logMessage: any){
    console.log(logType, logMessage.toString())

    if (logType === myVariables.LOG_INFO) {
        logger.info(logMessage);
    } else {
        logger.error(logMessage);
        sentry.captureException(logMessage);

    }
}