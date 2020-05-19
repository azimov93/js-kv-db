import EventEmitter from 'events';
import { readFromFile } from '../../modules/filesystem/readFromFile';
import { generateFile } from '../../modules/filesystem/generateFile';
import { logger } from '../../modules/logger';

class DataStore extends EventEmitter {
	constructor(namespace, opts = {}) {
		super();
		
		if (opts.fileName !== 'string') {
			opts.fileName = `${namespace}.store`;
		}
		
		this.opts = {
			namespace,
			serialize: JSON.stringify,
			deserialize: JSON.parse,
			...opts
		};
	}
	
	_createPrefix = (key) => {
		return `${this.opts.namespace}:${key}`
	}
	
	_saveStore = () => {
		const { fileName } = this.opts;
		generateFile(fileName, this.store);
	}

	generateStore = async () => {
		const { fileName } = this.opts;
	
		try {
			this.store = new Map();
			const returnedData = await readFromFile(fileName);
			
			if (returnedData) {
				returnedData.forEach(row => {
					if (row.length) {
						const [key, value] = row.split('<=>');
						
						if (value) {
							this.store.set(key, value);
						}
					}
				});
			}
		} catch (err) {
			logger.error(err);
			this.store = new Map();
			this._saveStore();
		}
	}
	
	get = (key) => {
		const keyPrefix = this._createPrefix(key);
		const { store, opts } = this;
		
		return Promise.resolve()
			.then(() => store.get(keyPrefix))
			.then(data => (typeof data === 'string') ? opts.deserialize(data) : data)
			.then(data => {
				if (data === undefined) {
					return undefined
				}

				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					this.emit('data_updated', {
						namespace: opts.namespace
					});
					return undefined;
				}

				return data.value;
			})
	}
	
	set = (key, value, ttl) => {
		const keyPrefix = this._createPrefix(key);
		const { store, opts } = this;
		
		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				const dataValue = { value, expires };
				
				return opts.serialize(dataValue);
			})
			.then(value => {
				store.set(keyPrefix, value);
				this.emit('data_updated', {
					namespace: opts.namespace
				});
			});
	};

	delete = (key) => {
		const keyPrefix = this._createPrefix(key);
		const { store, opts } = this;
		return Promise.resolve()
			.then(() => {
				store.delete(keyPrefix);
				this.emit('data_updated', {
					namespace: opts.namespace
				});
			});
	}

	clear = () => {
		const { store, opts } = this.opts;
		return Promise.resolve()
			.then(() => {
				store.clear();
				this.emit('data_updated', {
					namespace: opts.namespace
				});
			});
	}
	
	getStore = () => {
		return this.store;
	}
	
	getLength = () => {
		return this.store.size;
	}
}

export default DataStore;
