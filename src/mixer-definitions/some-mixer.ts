import { MixerDefNode } from '../types';

export const someMixer: MixerDefNode = {
	channelStrips: {
		_type: 'array',
		start: 1,
		end: 8,
		items: {
			mute: { _type: 'boolean', default: false },
			fader: { _type: 'number', min: -Infinity, max: 10, default: -Infinity },
		},
	},
	config: {
		reset: { _type: 'boolean', default: false },
	},
};


