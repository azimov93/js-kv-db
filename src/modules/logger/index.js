import winston from 'winston';
import 'winston-daily-rotate-file';
import CONSTANTS from '../../config/constants';

const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} - [${level}]: ${message}`;
});

const transport = new (winston.transports.DailyRotateFile)({
	dirname: `${ CONSTANTS.MAIN_DIRECTORY }${ CONSTANTS.LOG_DIRECTORY }`,
	filename: 'log-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '50m',
	maxFiles: '14d'
});

export const logger = winston.createLogger({
	format: combine(
		timestamp(),
		myFormat
	),
	transports: [
		transport
	]
});
