import EventEmitter from 'events';
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
			end: 8,
			indexDigits: 2,
			items: {
				mute: {
					nativeAddresses: [['ch', 2, 'mute']],
					_type: 'boolean',
					default: false,
				},
				level: {
					nativeAddresses: [['ch', 2, 'fader']],
					_type: 'number',
					min: -Infinity,
					max: 10,
					default: -Infinity,
				},
				dca: {
					_type: 'array',
					end: 2,
					items: {
						nativeAddresses: [['_translate', 'ch', 2, 'dcas', 4]],
						_type: 'boolean',
						default: false,
					},
				},
			},
		},
		main: {
			_type: 'array',
			end: 1,
			items: {
				mute: {
					nativeAddresses: [['ch', 2, 'mute']],
					_type: 'boolean',
					default: false,
				},
				level: {
					nativeAddresses: [['ch', 2, 'fader']],
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
			end: 2,
			items: {
				mute: {
					nativeAddresses: [['dca', 3, 'mute']],
					_type: 'boolean',
					default: false,
				},
				level: {
					nativeAddresses: [['dca', 3, 'mute']],
					_type: 'number',
					min: -Infinity,
					max: 10,
					default: -Infinity,
				},
			},
		},
	},
	config: {
		name: {
			nativeAddresses: [['-config', 'name']],
			_type: 'string',
			default: 'Some Mixer',
		},
	},
};

export interface NoMixerEngine {
	on<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	once<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	off<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	emit<U extends keyof mixerEvents>(
		event: U,
		...args: Parameters<mixerEvents[U]>
	): boolean;
}

export class NoMixerEngine extends EventEmitter implements MixerEngine {
	readonly nativeTreeTranslator: TreeTranslator;
	constructor(
		readonly ip: string,
		private _updateValues: (values: [string[][], LeafValue][]) => void
	) {
		super();
		const self = this;
		this.nativeTreeTranslator = new TreeTranslator((err) => {
			self.emit('error', err);
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
