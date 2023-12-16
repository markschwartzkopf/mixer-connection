import * as dgram from 'dgram';
import { EventEmitter } from 'events';

import {
	LeafValue,
	MixerEngine,
	TreeTranslator,
	mixerEvents,
} from '../mixer-node-leaf';
import { MixerDefinition } from './all-mixers';
import {
	oscBufferToMessage,
	oscMessage,
	oscMessageToBuffer,
} from '../oscUtils';

export const x32: MixerDefinition = {
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
	private _socket: dgram.Socket;
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
		this._socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
		this._socket.on('close', () => {
			this.emit('closed');
		});
		this._socket.on('error', (err) => {
			this.emit('error', String(err));
		});
		this._socket.on('connect', () => {
			this._handshake();
		});
		this._socket.on('message', (buf) => {
			console.log(oscBufferToMessage(buf));
		});
		this._socket.bind(0, '0.0.0.0', () => {
			this.emit('info', `Connecting to X32 at ${ip}`);
			this._socket.connect(10023, ip);
		});
	}

	get connected() {
		try {
			return !!this._socket.remoteAddress();
		} catch {
			return false;
		}
	}

	setMixer(values: [string[], LeafValue][]) {
		this._updateValues(
			values.map((x) => {
				return [this.nativeTreeTranslator.nativeAddressToLocal(x[0]), x[1]];
			})
		);
	}

	private _handshake() {
		this._send({ address: ['info'], args: [] });
	}

	/* private _sendAndWait(cmd: string, args?: oscArgument[], response: string) {

	} */

	private _send(msg: oscMessage) {
		if (!this.connected) {
			this.emit('error', 'Cannot send message to unconnected X32');
		}
		this._socket.send(oscMessageToBuffer(msg), (err) => {
			if (err) this.emit('error', String(err));
		});
	}
}
