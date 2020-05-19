import fs from 'fs';
import CONSTANTS from '../../config/constants';
import { logger } from '../logger';

export const generateFile = (fileName, data) => {
	const pathName = `${ CONSTANTS.MAIN_DIRECTORY }${ CONSTANTS.DB.PERSISTENCE_STORAGE }${ fileName }`;
	const isCorrectDataType = data instanceof Map;
	
	if (!data || isCorrectDataType && data.size === 0) {
		fs.writeFile(pathName, new Date(), (err) => {
			if (err) {
				logger.error(err);
			}

			logger.info(`${fileName} has been created!`);
		});

		return true;
	}

	if (!isCorrectDataType) {
		logger.info('Data type is invalid or data is empty!');
		return false;
	}

	const stream = fs.createWriteStream(pathName);
	
	stream.once('open', () => {
		data.forEach((value, key) => {
			const string = `${key}<=>${value}\n`
			stream.write(string);
		})
		stream.end();
	})
	
	stream.on('error', (err) => {
		logger.error(err);
	})
};
