import { getFileList } from '../modules/filesystem/getFileList';
import DataStore from './Datastore/Datastore';
import CONSTANTS from '../config/constants';

class Database {
	constructor(storage, opts) {
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
				
				return this.createNamespace(namespace);
			}));
			
			console.log('generated');
		} catch (err) {
			console.log(err);
		}
	}
	
	createNamespace = async (namespace, opts) => {
		this.store[namespace] = new DataStore(namespace, opts);
		
		try {
			await this.store[namespace].generateStore();
		} catch (err) {
			console.log(err);
		}
	}
	
	getNamespace = (namespace) => {
		return this.store[namespace]
	}
	
	getStore = () => {
		return this.store;
	}
}

export default new Database(`${CONSTANTS.MAIN_DIRECTORY}${CONSTANTS.DB.PERSISTENCE_STORAGE}`);
