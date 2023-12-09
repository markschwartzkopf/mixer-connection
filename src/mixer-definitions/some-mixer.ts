import {
	LeafValue,
	MixerDefNode,
	MixerEngine,
	TreeTranslator,
} from '../mixer-node-leaf';

export const someMixer: MixerDefNode = {
	channelStrips: {
		_type: 'array',
		start: 0,
		end: 7,
		indexDigits: 2,
		items: {
			mute: {
				nativeAddress: ['allMutesDumb', 'ch', 2, 'mute'],
				_type: 'boolean',
				default: false,
			},
			fader: {
				nativeAddress: ['ch', 2, 'fader'],
				_type: 'number',
				min: -Infinity,
				max: 10,
				default: -Infinity,
			},
			dcas: {
				_type: 'array',
				end: 2,
				items: {
					nativeAddress: ['_translate', 'ch', 2, 'dcas', 4],
					_type: 'boolean',
					default: false,
				},
			},
		},
	},
	config: {
		name: {
			nativeAddress: ['-config', 'name'],
			_type: 'string',
			default: 'Some Mixer',
		},
	},
};

export class SomeMixerEngine implements MixerEngine {
	readonly nativeTreeTranslator: TreeTranslator;
	constructor(
		readonly ip: string,
		private _processValuesFromEngine: (values: [string[], LeafValue][]) => void,
		readonly error: (err: string) => void
	) {
		this.nativeTreeTranslator = new TreeTranslator(error);
	}
	setMixer(values: [string[], LeafValue][]) {
		this._processValuesFromEngine(values.map((x) => {
			return [this.nativeTreeTranslator.nativeAddressToLocal(x[0]), x[1]];
		}));
	}
}
