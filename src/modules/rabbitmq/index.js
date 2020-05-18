import amqp from 'amqplib';
import CONSTANTS from '../../config/constants';

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

			console.error('RabbitMQ connected!');
		} catch (e) {
			console.error('RabbitMQ connection error => ', e);
			throw new Error(e);
		}

		process.once('SIGINT', () => this.connection.close());
	};
	
	consume = async (callback) => {
		try {
			const options = { durable: true, noAck: true };
			await this.channel.assertQueue(this.queueName, options);
			await this.channel.consume(this.queueName, callback);
		} catch (e) {
			console.error('Error => ', e);
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

			console.error('New data was sent to queue!');
		} catch (e) {
			console.error('Error => ', e);
			throw new Error(e);
		}
	};

	close = () => {
		this.connection.close();

		console.error('RabbitMQ disconnected!');
	}
}

export default MqModule;
