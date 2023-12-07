import EventEmitter from 'events';
import mixers from './mixer-definitions/all-mixers';
import { MixerModel, MixerTrees } from './generated-mixer-types';
import {
	MixerNode,
	TreeTranslator,
	ValueNode,
	getNodeValue,
	getSettingAddressesAndValues,
} from './mixer-node-leaf';

export interface MixerModule {
	close: () => void;
	status: MixerStatus;

	on<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
	once<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
	emit<U extends keyof ModuleEvents>(
		event: U,
		...args: Parameters<ModuleEvents[U]>
	): boolean;
}

export type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';

interface ModuleEvents {
	error: (err: Error) => void;
	closed: () => void;
	info: (info: string) => void;
	connected: () => void;
}

interface MixerEvents {
	error: (err: Error) => void;
	closed: () => void;
	info: (info: string) => void;
	connected: () => void;
}

interface Mixer<T extends MixerModel> {
	on<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
	off<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
	once<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
	emit<U extends keyof MixerEvents>(
		event: U,
		...args: Parameters<MixerEvents[U]>
	): boolean;
}

class Mixer<T extends MixerModel> extends EventEmitter {
	private _rootNode: MixerNode;
	private _treeTranslator: TreeTranslator;
	//private _module: MixerModule;

	constructor(readonly address: string, readonly model: T) {
		super();
		this._treeTranslator = new TreeTranslator();
		this._rootNode = new MixerNode(mixers[model], [], null, this._treeTranslator);
		/* switch (model) {
			case 'someMixer':
				this._rootNode = mixerRoots.someMixer;
				//this._module = new NoMixer(address);
				break;
			default:
				this.emit('error', new Error('Invalid mixer model: ' + model));
				this._module = new NoMixer(address);
				console.error('switch this to noMixer');
				break;
		} */
		/* this._module.on('info', (info) => {
			this.emit('info', info);
		});
		this._module.on('connected', () => {
			this.emit('connected');
		});
		this._module.on('closed', () => {
			this.emit('closed');
		});
		this._module.on('error', (err) => {
			this.emit('error', err);
		}); */
	}

	//this is testing code. Delete it later
	get rootNode() {
		return this._rootNode;
	}
	get treeValue(): MixerTrees[T] {
		return getNodeValue(this._rootNode) as unknown as MixerTrees[T];
	}
	getAddr(val: ValueNode) {
		return getSettingAddressesAndValues(this._rootNode, val);
	}
	get tree() {
		return this._treeTranslator.tree;
	}

	close() {
		this.emit('error', new Error('Code mixer closing'));
	}

	/* get status() {
		return this._module.status;
	} */
}

export default Mixer;

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};
