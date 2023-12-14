import * as dgram from 'dgram';
import { EventEmitter } from 'events';

import {
	LeafValue,
	MixerEngine,
	TreeTranslator,
	mixerEvents,
} from '../mixer-node-leaf';
import { MixerDefinition } from './all-mixers';

export const noMixer: MixerDefinition = {
	strips: {
		ch: {
			_type: 'array',
			end: 32,
			indexDigits: 2,
			items: {
				mute: {
					nativeAddresses: [['ch', 2, 'mix', 'on']],
					_type: 'boolean',
					default: false,
				},
				level: {
					nativeAddresses: [['ch', 2, 'mix', 'fader']],
					_type: 'number',
					min: -Infinity,
					max: 10,
					default: -Infinity,
				},
				dca: {
					_type: 'array',
					end: 2,
					items: {
						nativeAddresses: [['_translate', 'ch', 2, 'grp', 'dca', 4]],
						_type: 'boolean',
						default: false,
					},
				},
			},
		},
		main: {
			_type: 'array',
			end: 2,
			items: {
				mute: {
					nativeAddresses: [['_translate', 'main', 2, 'mix', 'on']],
					_type: 'boolean',
					default: false,
				},
				level: {
					nativeAddresses: [['_translate', 'main', 2, 'mix', 'fader']],
					_type: 'number',
					min: -Infinity,
					max: 10,
					default: -Infinity,
				},
			},
		},
	},
	groups: {
		dca: {
			_type: 'array',
			end: 8,
			items: {
				mute: {
					nativeAddresses: [['dca', 3, 'on']],
					_type: 'boolean',
					default: false,
				},
				level: {
					nativeAddresses: [['dca', 3, 'fader']],
					_type: 'number',
					min: -Infinity,
					max: 10,
					default: -Infinity,
				},
			},
		},
	},
};

export interface X32Engine {
	on<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	once<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	off<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	emit<U extends keyof mixerEvents>(
		event: U,
		...args: Parameters<mixerEvents[U]>
	): boolean;
}

export class X32Engine extends EventEmitter implements MixerEngine {
	readonly nativeTreeTranslator: TreeTranslator;
	socket: dgram.Socket;
	connected = false;
	lastValidMessage = Date.now();

	constructor(
		readonly ip: string,
		private _updateValues: (values: [string[][], LeafValue][]) => void
	) {
		super();
		const self = this;
		this.nativeTreeTranslator = new TreeTranslator((err) => {
			self.emit('error', err);
		});
		this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
		this.socket.on('close', () => {
			this.emit('closed');
		});
		this.socket.on('error', (err) => {
			this.emit('error', String(err));
		});
		this.socket.on('connect', () => {
			console.log('X32 connected!');
		});
		this.socket.on('message', (buf) => {
			console.log(buf.toString());
		});
		this.socket.bind(52361, '0.0.0.0', () => {
			this.emit('info', 'Connecting to X32 at ' + ip);
			this.socket.connect(10023, ip);
		});
	}

	setMixer(values: [string[], LeafValue][]) {
		this._updateValues(
			values.map((x) => {
				return [this.nativeTreeTranslator.nativeAddressToLocal(x[0]), x[1]];
			})
		);
	}
}
