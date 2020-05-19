import http from 'http';
import CONSTANTS from './config/constants';
import Database from './database/Database';
import { startListener } from './listener';
import { logger } from './modules/logger';

const port = CONSTANTS.DB.PORT;

const requestHandler = (request, response) => {
	logger.info(`HTTP Request by url => ${request.url}`);
	response.end('Hello Node.js Server!')
};

Database.generate();

Database.on('db_update', ({ namespace }) => {
	const selectedStore = Database.getNamespace(namespace);

	logger.info(`Stores was saved to files.`);
	
	selectedStore._saveStore();
})

startListener();

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
	if (err) {
		return logger.error(err);
	}

	logger.info(`Server is listening on ${port}`);
})
