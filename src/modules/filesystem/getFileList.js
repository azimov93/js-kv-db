import fs from 'fs';

export const getFileList = async (folder) => {
	return new Promise((resolve, reject) => {
		fs.readdir(folder, (err, files) => {
			if (err) {
				reject(err);
				return;
			}
			
			resolve(files);
		});
	})
}
