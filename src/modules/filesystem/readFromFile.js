import fs from 'fs';
import CONSTANTS from '../../config/constants';

export const readFromFile = (fileName) => {
	const pathName = `${ CONSTANTS.MAIN_DIRECTORY }${ CONSTANTS.DB.PERSISTENCE_STORAGE }${ fileName }`;

	const stream = fs.createReadStream(pathName);

	stream.on('end', () => {
		console.log(`${fileName} was processed`);
	});
	
	return new Promise((resolve, reject) => {
		stream.on('readable', () => {
			const dataBuffer = stream.read();
			if (dataBuffer !== null) {
				const data = dataBuffer.toString();
				const rowsArray = data.split('\n');
				resolve(rowsArray);
			}
		})

		stream.on('error', (err) => {
			if (err.code === 'ENOENT'){
				console.log(`File ${fileName} not found`);
				reject(`File ${fileName} not found`);
			} else {
				console.error(err);
				reject(err);
			}
		});
	});
};
