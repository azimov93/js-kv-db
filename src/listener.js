import MqModule from './modules/rabbitmq';
import CONSTANTS from './config/constants';

const publisher = new MqModule({
	url: CONSTANTS.MQ.URL,
	queue: CONSTANTS.MQ.OUTCOME_QUEUE,
	type: 'publish'
});

const consumeCallback = (data) => {
	const decodedJson = data.content.toString();
	const decodedData = JSON.parse(decodedJson);
	console.log(decodedData);
}

export const startListener = async () => {
	const subscriber = new MqModule({
		url: CONSTANTS.MQ.URL,
		queue: CONSTANTS.MQ.INCOME_QUEUE,
		type: 'subscribe'
	});
	
	await publisher.connect();
	
	await subscriber.connect();
	await subscriber.consume((data) => {
		consumeCallback(data);
		subscriber.channel.ack(data);
	});
}
