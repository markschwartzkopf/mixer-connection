import { MixerDefNode } from '../../mixer-node-leaf';

const someMixer: MixerDefNode = {
	channelStrips: {
		_type: 'array',
		start: 1,
		end: 8,
		indexDigits: 2,
		items: {
			mute: {
				mixerAddress: ['ch', 2, 'mute'],
				_type: 'boolean',
				default: false,
			},
			fader: {
				mixerAddress: ['ch', 2, 'fader'],
				_type: 'number',
				min: -Infinity,
				max: 10,
				default: -Infinity,
			},
		},
	},
	testLeaves: {
		_type: 'array',
		start: 1,
		end: 3,
		indexDigits: 3,
		items: {
			mixerAddress: ['test', 2],
			_type: 'boolean',
			default: false,
		},
	},
	config: {
		name: {
			mixerAddress: ['-config', 'name'],
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
