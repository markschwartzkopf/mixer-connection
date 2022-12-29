import EventEmitter from 'events';
import { X32 } from './x32';
import { MixerModule } from './types';

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
				this._module = new X32(address);
				console.error('Code this mixer');
				break;
			default:
				this.emit('error', new Error('Invalid mixer model: ' + model));
        this._module = new X32(address);
        console.error('switch this to noMixer');
				break;
		}
	}

	close() {
		this.emit('error', new Error('Code X32 closing'));
	}

	get status() {
		return this._module.status;
	}
}

export default Mixer;
