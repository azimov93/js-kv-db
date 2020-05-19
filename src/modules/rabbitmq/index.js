import amqp from 'amqplib';
import CONSTANTS from '../../config/constants';
import { logger } from '../logger';

class MqModule {
	constructor(params = { 
		url: CONSTANTS.MQ.URL, 
		queue: CONSTANTS.MQ.INCOME_QUEUE, 
		type: 'subscribe' 
	}) {
		this.url = params.url;
		this.queueName = params.queue;
		this.type = params.type;
		this.channel = null;
		this.connection = null;
	}

	connect = async () => {
		try {
			this.connection = await amqp.connect(this.url);
			this.channel = await this.connection.createChannel();

			logger.info(`[${this.type}] RabbitMQ connected!`)
		} catch (e) {
			logger.error(e);
			throw new Error(e);
		}

		process.once('SIGINT', () => this.connection.close());
	};
	
	consume = async (callback) => {
		try {
			const options = { durable: true, noAck: true };
			await this.channel.assertQueue(this.queueName, options);
			await this.channel.consume(this.queueName, (data) => {
				callback(data, this.channel);
			});
		} catch (e) {
			logger.error(e);
			throw new Error(e);
		}
	}

	sendToQueue = async (data) => {
		try {
			const jsonData = JSON.stringify(data);
			const bufferedData = Buffer.from(jsonData, 'utf8');

			const options = { durable: true, noAck: true };

			await this.channel.assertQueue(this.queueName, options);
			await this.channel.sendToQueue(this.queueName, bufferedData);
		} catch (e) {
			logger.error(e);
			throw new Error(e);
		}
	};

	close = () => {
		this.connection.close();

		logger.info(`[${this.type}] RabbitMQ disconnected!`);
	}
}

export default MqModule;
