import EventEmitter from 'events';
import { getFileList } from '../modules/filesystem/getFileList';
import DataStore from './Datastore/Datastore';
import CONSTANTS from '../config/constants';
import { logger } from '../modules/logger';

class Database extends EventEmitter {
	constructor(storage, opts) {
		super()
		this.store = {};
		this.opts = {
			storage,
			...opts
		}
	}
	
	generate = async () => {
		const { storage } = this.opts;
		
		try {
			const storedFiles = await getFileList(storage);
			
			await Promise.all([...storedFiles].map((fileName) => {
				const [namespace, _] = fileName.split('.');

				logger.info(`${namespace} store was generated!`);
				return this.createNamespace(namespace);
			}));
		} catch (err) {
			logger.error(err);
		}
	}
	
	createNamespace = async (namespace, opts) => {
		this.store[namespace] = new DataStore(namespace, opts);
		
		try {
			await this.store[namespace].generateStore();
			this.store[namespace].on('data_updated', this.eventHandler)
		} catch (err) {
			logger.error(err);
		}
	}
	
	eventHandler = (eventData) => {
		this.emit('db_update', eventData);
	}
	
	processData = async (body) => {
		const { type, command, namespace, data } = body;
		
		let response = {};
		
		switch (type) {
			case 'db': {
				response = await this.processDbRequest(command, namespace);
				break;
			}
			
			case 'store': {
				response = await this.processStoreRequest(command, namespace, data);
				
				break;
			}
		}
		
		return {
			type,
			...response
		}
	}
	
	processDbRequest = async (command, namespace) => {
		const responseBody = {
			command,
			namespace,
			response: {}
		}
		
		switch (command) {
			case 'get': {
				const selectedStore = this.getNamespace(namespace);
				
				if (selectedStore) {
					responseBody.response.length = selectedStore.getLength();
				} else {
					responseBody.response.error = 'Store not found!';
				}
				
				break;
			}
			
			case 'set': {
				await this.createNamespace(namespace);
				
				responseBody.response.status = 'created';
				
				break;
			}
			
			case 'delete': {
				const selectedStore = this.getNamespace(namespace);

				if (selectedStore) {
					await selectedStore.clear();
					responseBody.response.status = 'cleared';
				} else {
					responseBody.response.error = 'Store not found!';
				}
				
				break;
			}
		}
		
		return responseBody;
	}
	
	processStoreRequest = async (command, namespace, { key, value, ttl }) => {
		const responseBody = {
			command,
			namespace,
			response: {}
		}

		const selectedStore = this.getNamespace(namespace);
		
		if (!selectedStore) {
			responseBody.response.error = 'Store not found!';
			return responseBody;
		}
		
		try {
			switch (command) {
				case 'get': {
					const data = await selectedStore.get(key);

					if (!data) {
						responseBody.response.error = `Key "${key}" not found!`;
					} else {
						responseBody.response = {
							key,
							value: data
						}
					}

					break;
				}
				
				case 'set': {
					await selectedStore.set(key, value, ttl);

					responseBody.response = {
						key,
						status: 'created'
					};
					break;
				}
				
				case 'delete': {
					await selectedStore.delete(key);

					responseBody.response = {
						key,
						status: 'deleted'
					};
					
					break;
				}
			}
		} catch (err) {
			logger.error(err);
			responseBody.response.error = 'Something went wrong!';
		}
		
		return responseBody;
	}
	
	getNamespace = (namespace) => {
		return this.store[namespace] || null;
	}
	
	getStore = () => {
		return this.store;
	}
}

export default new Database(`${CONSTANTS.MAIN_DIRECTORY}${CONSTANTS.DB.PERSISTENCE_STORAGE}`);
