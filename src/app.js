import http from 'http';
import CONSTANTS from './config/constants';
import Database from './database/Database';
import { startListener } from './listener';

const port = CONSTANTS.DB.PORT;

const requestHandler = (request, response) => {
	console.log(request.url);
	response.end('Hello Node.js Server!')
};

Database.generate();

startListener();

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	console.log(`server is listening on ${port}`)
})
