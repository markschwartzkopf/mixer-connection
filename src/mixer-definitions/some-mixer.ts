import { MixerDefNode } from '../mixer-node-leaf';

const someMixer: MixerDefNode = {
	channelStrips: {
		_type: 'array',
		start: 0,
		end: 7,
		indexDigits: 2,
		items: {
			mute: {
				localAddress: ['allMutesDumb', 'ch', 2, 'mute'],
				_type: 'boolean',
				default: false,
			},
			fader: {
				localAddress: ['ch', 2, 'fader'],
				_type: 'number',
				min: -Infinity,
				max: 10,
				default: -Infinity,
			},
			dcas: {
				_type: 'array',
				end: 2,
				items: {
					localAddress: ['_translate', 'ch', 2, 'dcas', 4],
					_type: 'boolean',
					default: false
				}
			}
		},
	},
	config: {
		name: {
			localAddress: ['-config', 'name'],
			_type: 'string',
			default: 'Some Mixer',
		},
	},
};

/* const someMixer: MixerDefNode = {
	channelStrips: {
		'01': { _type: 'number', min: -Infinity, max: 10, default: -Infinity},
		'02': { _type: 'number', min: -Infinity, max: 10, default: -Infinity},
	},
	config: {
		name: { _type: 'string', default: 'Some Mixer' },
	},
}; */

export { someMixer };
