import MqModule from './modules/rabbitmq';
import CONSTANTS from './config/constants';
import { commandSchema } from './schemas/consumerData';
import Database from './database/Database';
import { logger } from './modules/logger';

const _validationOptions = {
	abortEarly: false, // abort after the last validation error
	allowUnknown: false, // allow unknown keys that will be ignored
	stripUnknown: false // remove unknown keys from the validated data
};

const publisher = new MqModule({
	url: CONSTANTS.MQ.URL,
	queue: CONSTANTS.MQ.OUTCOME_QUEUE,
	type: 'publish'
});

const consumeCallback = async (data, channel) => {
	const decodedJson = data.content.toString();
	const decodedData = JSON.parse(decodedJson);
	
	try {
		const value = await commandSchema.validateAsync(decodedData, _validationOptions);
		
		const response = await Database.processData(value);

		channel.ack(data);
		
		if (response) {
			await publisher.sendToQueue(response);
		}
	} catch (err) {
		logger.error(err.message);
		
		const errorResponse = {
			originalRequest: { ...decodedData },
			error: err.message
		} 
		
		channel.ack(data);

		await publisher.sendToQueue(errorResponse);
	}
}

export const startListener = async () => {
	const subscriber = new MqModule({
		url: CONSTANTS.MQ.URL,
		queue: CONSTANTS.MQ.INCOME_QUEUE,
		type: 'subscribe'
	});
	
	await publisher.connect();
	
	await subscriber.connect();
	await subscriber.consume(consumeCallback);
}
