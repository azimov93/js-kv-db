import path from 'path';

export default {
	MAIN_DIRECTORY: path.join(__dirname, '../../'),
	LOG_DIRECTORY: process.env.DB_LOG_PATH || 'logs/',
	DB: {
		PORT: process.env.DB_PORT,
		NAME: process.env.DB_NAME,
		PERSISTENCE_STORAGE: process.env.DB_PERSISTENCE_STORAGE || 'storage/',
	},
	MQ: {
		URL: process.env.DB_MQ_PATH,
		INCOME_QUEUE: process.env.DB_INCOME_QUEUE,
		OUTCOME_QUEUE: process.env.DB_OUTCOME_QUEUE,
	}
}
