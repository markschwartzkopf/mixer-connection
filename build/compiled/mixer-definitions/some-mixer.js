"use strict";
/* const someMixer: MixerDefNode = {
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
        name: { _type: 'string', default: 'Some Mixer' },
    },
}; */
Object.defineProperty(exports, "__esModule", { value: true });
exports.someMixer = void 0;
const someMixer = {
    channelStrips: {
        '01': { _type: 'number', min: -Infinity, max: 10, default: -Infinity },
        '02': { _type: 'number', min: -Infinity, max: 10, default: -Infinity },
    },
    config: {
        name: { _type: 'string', default: 'Some Mixer' },
    },
};
exports.someMixer = someMixer;
