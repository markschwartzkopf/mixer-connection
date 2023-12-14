import {
	MixerDefArray,
	MixerDefLeafBoolean,
	MixerDefLeafEnum,
	MixerDefLeafNumber,
	MixerDefLeafString,
	MixerDefNode,
} from '../mixer-node-leaf';
import { noMixer, NoMixerEngine } from './no-mixer';

export const mixerDefinitions = { noMixer /* , someOtherMixer */ };
export const mixerEngines = {
	noMixer: NoMixerEngine /* , someOtherMixer: SomeOtherMixerEngine */,
};

export interface MixerDefinition extends MixerDefNode {
	strips: {
		ch: MixerStrips;
		aux?: MixerStrips;
		fxrtn?: MixerStrips;
		bus?: MixerStrips;
		matrix?: MixerStrips;
		main: MixerStrips;
	};
	groups: {
		dca: MixerDcas;
		muteGroup?: MixerMuteGroups;
		layer?: MixerLayers;
	};
	fx?: { model: MixerDefLeafEnum } & MixerDefNode;
	preamps?: {
		[k: string]: Preamps
	};
	config?: MixerDefNode;
}

interface MixerStrips extends MixerDefArray {
	items: MixerStrip
}

interface MixerStrip extends MixerDefNode {
	name?: MixerDefLeafString;
	color?: MixerDefLeafEnum; //hex color string. Should implement translation to closest color
	icon?: MixerDefLeafNumber;
	source?: {
		type: MixerDefLeafEnum;
		index: MixerDefLeafNumber;
	};
	delay?: {
		time: MixerDefLeafNumber; //ms
		on?: MixerDefLeafNumber;
	};
	preamp?: {
		gain?: MixerDefLeafNumber; //db
		trim?: MixerDefLeafNumber; //db
		invert?: MixerDefLeafBoolean;
	};
	mute: MixerDefLeafBoolean;
	level: MixerDefLeafNumber; //db
	pan?: MixerDefLeafNumber; //%
	width?: MixerDefLeafNumber; //%
	custom?: MixerDefNode;
	eq?: {
		filters?: {
			//dedicated filters
			hp?: {
				freq: MixerDefLeafNumber; //Hz
				slope: MixerDefLeafNumber;
				on: MixerDefLeafBoolean;
			};
			lp?: {
				freq: MixerDefLeafNumber; //Hz
				slope: MixerDefLeafNumber;
				on: MixerDefLeafBoolean;
			};
		};
		bands?: eqBands;
	};
	gate?: MixerGatePlugin;
	comp?: MixerCompPlugin;
	order?: MixerDefLeafEnum; //order of processing. Input is always first. Should maybe be a custom leaf type at some point
	send?: {
		bus?: MixerSends;
		matrix?: MixerSends;
		main?: MixerSends;
	}	
	dca?: MixerToggles;
	mutegroup?: MixerToggles;
}

interface MixerToggles extends MixerDefArray {
	items: MixerDefLeafBoolean
}

interface MixerSends extends MixerDefArray {
	items: MixerSend;
}

interface MixerSend extends MixerDefNode {
	index: MixerDefLeafNumber;
	on: MixerDefLeafBoolean;
	level: MixerDefLeafNumber; //db
	tap: MixerDefLeafEnum; //index of channel strip order that tap is after
	pan?: MixerDefLeafNumber; //%
	panFollow?: MixerDefLeafBoolean;
}

interface MixerCompPlugin extends MixerDefNode {
	type?: MixerDefLeafEnum;
	env?: DynamicsEnv;
	knee?: MixerDefLeafNumber;
	mgain: MixerDefLeafNumber;
	thr: MixerDefLeafNumber; //db
	auto?: MixerDefLeafBoolean;
	att?: MixerDefLeafNumber; //ms
	hold?: MixerDefLeafNumber; //ms
	rel?: MixerDefLeafNumber; //ms
	ratio: MixerDefLeafNumber; //db
}

interface MixerGatePlugin extends MixerDefNode {
	type?: MixerDefLeafEnum;
	env?: DynamicsEnv;
	thr: MixerDefLeafNumber; //db
	auto?: MixerDefLeafBoolean;
	att?: MixerDefLeafNumber; //ms
	hold?: MixerDefLeafNumber; //ms
	rel?: MixerDefLeafNumber; //ms
	range: MixerDefLeafNumber; //db
}

interface DynamicsEnv extends MixerDefLeafEnum {
	values: ['lin', 'log'];
}

interface eqBands extends MixerDefArray {
	items: eqBand;
}

interface eqBand extends MixerDefNode {
	type?: MixerDefLeafEnum;
	gain?: MixerDefLeafNumber; //db
	freq: MixerDefLeafNumber; //Hz
	q?: MixerDefLeafNumber; //q or slope
	on?: MixerDefLeafBoolean;
}

interface MixerDcas extends MixerDefArray {
	items: {
		mute: MixerDefLeafBoolean;
		level: MixerDefLeafNumber;
		name?: MixerDefLeafString;
		icon?: MixerDefLeafNumber;
		color?: MixerDefLeafEnum;
	};
}

interface MixerMuteGroups extends MixerDefArray {
	items: { on: MixerDefLeafBoolean; name?: MixerDefLeafString };
}

interface MixerLayers extends MixerDefArray {
	items: MixerLayer;
}

interface MixerLayer extends MixerDefNode {
	name?: MixerDefLeafString;
	strips: MixerLayerStrips;
}

interface MixerLayerStrips extends MixerDefArray {
	items: { type: ChannelStripType; index: MixerDefLeafNumber };
}

interface ChannelStripType extends MixerDefLeafEnum {
	values: ['ch', ...('aux' | 'fxrtn' | 'bus' | 'matrix')[], 'main'];
}

interface Preamps extends MixerDefArray {
	items: Preamp
}

interface Preamp extends MixerDefNode {
	gain: MixerDefLeafNumber;
	phantom?: MixerDefLeafBoolean;
}