import EventEmitter from 'events';
import { X32 } from './x32/x32';
import {
	MixerLeaf,
	MixerLeafError,
	MixerModule,
	MixerNode,
	NodeObject,
	NodeValue,
} from './types';
import { NoMixer } from './nomixer/nomixer';
import {
	cloneMixerNode,
	getValFromNode,
} from './mixer-object-utils/mixer-object-utils';

type MixerModel = 'XM32' | 'Xair' | 'Wing' | 'noMixer';

interface MixerEvents {
	error: (err: Error) => void;
	closed: () => void;
	info: (info: string) => void;
	connected: () => void;
}

interface Mixer {
	on<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
	once<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
	emit<U extends keyof MixerEvents>(
		event: U,
		...args: Parameters<MixerEvents[U]>
	): boolean;
}

class Mixer extends EventEmitter {
	readonly address: string;
	readonly model: MixerModel;
	private _module: MixerModule;

	constructor(address: string, model: MixerModel) {
		super();
		this.address = address;
		this.model = model;
		switch (model) {
			case 'XM32':
				this._module = new X32(address);
				break;
			case 'Wing':
				this._module = new X32(address);
				console.error('Code this mixer');
				break;
			case 'Xair':
				this._module = new X32(address);
				console.error('Code this mixer');
				break;
			case 'noMixer':
				this._module = new NoMixer(address);
				break;
			default:
				this.emit('error', new Error('Invalid mixer model: ' + model));
				this._module = new X32(address);
				console.error('switch this to noMixer');
				break;
		}
		this._module.on('info', (info) => {
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
		});
	}

	close() {
		this.emit('error', new Error('Code X32 closing'));
	}

	get status() {
		return this._module.status;
	}

	setValue(address: string[], value: NodeValue | NodeObject): void | string {
		this._module.setValue(address, value);
	}

	getValue(
		address: string[],
		withMeta: 'withMeta'
	): MixerLeaf | MixerNode | MixerLeafError;
	getValue(address: string[]): NodeValue | NodeObject | null;
	getValue(address: string[], withMeta?: 'withMeta') {
		return withMeta
			? cloneMixerNode(
					getValFromNode(address, this._module.mixerObject, withMeta)
			  )
			: getValFromNode(address, this._module.mixerObject);
	}
}

export default Mixer;
