import EventEmitter from 'events';
import { readFromFile } from '../../modules/filesystem/readFromFile';
import { generateFile } from '../../modules/filesystem/generateFile';

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
			const returnedData = await readFromFile(fileName);
			this.store = new Map();
			
			returnedData.forEach(row => {
				if (row) {
					const [key, value] = row.split('<=>');
					this.store.set(key, value);
				}
			});
		} catch (err) {
			console.log(err);
			this.store = new Map();
			this._saveStore();
		}
	}
	
	get = (key) => {
		const keyPrefix = this._createPrefix(key);
		const { store } = this
		
		return Promise.resolve()
			.then(() => store.get(keyPrefix))
			.then(data => (typeof data === 'string') ? this.opts.deserialize(data) : data)
			.then(data => {
				if (data === undefined) {
					return undefined
				}

				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					this.emit('data_updated');
					return undefined;
				}

				return data.value;
			})
	}
	
	set = (key, value, opts) => {
		const keyPrefix = this._createPrefix(key);
		const { store } = this;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof opts.ttl === 'number') ? (Date.now() + opts.ttl) : null;
				const dataValue = { value, expires };
				
				return this.opts.serialize(dataValue);
			})
			.then(value => {
				store.set(keyPrefix, value);
				this.emit('data_updated');
			});
	};

	delete = (key) => {
		const keyPrefix = this._createPrefix(key);
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => {
				store.delete(keyPrefix);
				this.emit('data_updated');
			});
	}

	clear = () => {
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => {
				store.clear();
				this.emit('data_updated');
			});
	}
	
	getStore = () => {
		return this.store;
	}
}

export default DataStore;
