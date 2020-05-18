import fs from 'fs';
import CONSTANTS from '../../config/constants';

export const generateFile = (fileName, data) => {
	const pathName = `${ CONSTANTS.MAIN_DIRECTORY }${ CONSTANTS.DB.PERSISTENCE_STORAGE }${ fileName }`;
	const isCorrectDataType = data instanceof Map;
	
	if (!data || isCorrectDataType && data.size === 0) {
		fs.writeFile(pathName, '', (err) => {
			if (err) {
				console.log('Something went wrong!', err);
			}
			
			console.log('The file has been created!');
		});

		return true;
	}

	if (!isCorrectDataType) {
		console.log('Data type is invalid or data is empty!');
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
		console.log('Something went wrong!', err);
	})
};
