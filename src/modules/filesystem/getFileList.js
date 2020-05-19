import fs from 'fs';
import { logger } from '../logger';

export const getFileList = async (folder) => {
	return new Promise((resolve, reject) => {
		fs.readdir(folder, (err, files) => {
			if (err) {
				logger.error(err);
				reject(err);
				return;
			}
			
			resolve(files);
		});
	})
}
