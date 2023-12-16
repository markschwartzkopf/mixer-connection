import EventEmitter from 'events';
import { mixerDefinitions, mixerEngines } from './mixer-definitions/all-mixers';
import { MixerModel, MixerTrees } from './generated-mixer-types';
import { LeafValue, MixerEngine, MixerNode } from './mixer-node-leaf';

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
	private _mixerEngine: MixerEngine;

	constructor(readonly ip: string, readonly model: T) {
		super();
		//bullshit to prevent JS 'this' scope issues
		const self = this;
		const error = (err: string) => {
			self.emit('error', new Error(err));
		};
		const updateValues = (values: [string[][], LeafValue][]) => {
			values.forEach((val) => {
				val[0].forEach((address) => {
					self._rootNode.update(address, val[1]);
				});
			});
		};
		//add update frequency?
		switch (model) {
			case 'noMixer':
				this._mixerEngine = new mixerEngines[model](ip, updateValues);
				break;
			case 'x32':
				this._mixerEngine = new mixerEngines[model](ip, updateValues);
				break;
			default:
				this.emit('error', new Error('Invalid mixer model: ' + model));
				console.error('switch this to noMixer');
				this._mixerEngine = new mixerEngines['noMixer']('', updateValues);
				break;
		}
		this._mixerEngine.on('error', (err) => {
			error(err);
		});
		this._mixerEngine.on('info', (info) => {
			this.emit('info', info);
		});
		this._mixerEngine.on('closed', () => {
			this.emit('closed');
		});
		this._mixerEngine.on('connected', () => {
			this.emit('connected');
		});
		this._rootNode = new MixerNode(
			mixerDefinitions[model],
			[],
			null,
			{},
			this._mixerEngine,
			error
		);
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
	get state() {
		return this._rootNode.state as MixerTrees[T];
	}
	set state(state: MixerTrees[T]) {
		this._rootNode.state = state;
	}
	/* getAddr(val: NodeValue) {
		return getSettingAddressesAndValues(this._rootNode, val);
	} */
	/* get tree() {
		return this._treeTranslator.tree;
	} */

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
