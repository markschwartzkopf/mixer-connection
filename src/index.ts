import EventEmitter from 'events';

interface MixerEvents {
	error: (err: Error) => void;
	closed: () => void;
	info: (info: string) => void;
	connected: () => void;
}

interface Mixer {
	on<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
	off<U extends keyof MixerEvents>(event: U, listener: MixerEvents[U]): this;
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
			case 'noMixer':
				this._module = new NoMixer(address);
				break;
			default:
				this.emit('error', new Error('Invalid mixer model: ' + model));
				this._module = new NoMixer(address);
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
		this.emit('error', new Error('Code mixer closing'));
	}

	get status() {
		return this._module.status;
	}

	get dataTree(): tree<typeof this._module> {
		return this._module.mixerTree.getTree;
	}
}

export default Mixer;