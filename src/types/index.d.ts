import {
	MixerBoolean,
	MixerEnum,
	MixerExponential,
	MixerIndex,
	MixerKey,
	MixerLeaf,
	MixerLevel,
	MixerLinear,
	MixerString,
	MixerStripType,
} from '../mixer-object-utils/leaf-types';

export interface MixerModule {
	setValuePromise: (
		address: string[],
		value: NodeValue | NodeObject
	) => Promise<void>;
	setValue: (address: string[], value: NodeValue | NodeObject) => void | string;
	close: () => void;
	status: MixerStatus;
	mixerObject: MixerObject;

	on<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
	once<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
	emit<U extends keyof ModuleEvents>(
		event: U,
		...args: Parameters<ModuleEvents[U]>
	): boolean;
}

interface ModuleEvents {
	error: (err: Error) => void;
	closed: () => void;
	info: (info: string) => void;
	connected: () => void;
}

type NodeValue = MixerLeaf['value'];
type NodeObject =
	| { [k: string]: NodeValue | NodeObject }
	| NodeValue[]
	| NodeObject[];

type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';

type MixerObject = {
	strips: {
		ch: MixerStrip[];
		aux?: MixerStrip[];
		fxrtn?: MixerStrip[];
		bus?: MixerStrip[];
		matrix?: MixerStrip[];
		main: MixerStrip[];
	};
	groups: {
		dca: MixerDca[];
		muteGroup: MixerMuteGroup[];
		layer: MixerLayer[];
	};
	fx?: { model: MixerEnum } & { [k: string]: MixerNode | MixerLeaf };
	config: MixerNode;
	icons?: MixerIcons;
};

type MixerStrip = {
	name?: MixerString;
	color?: MixerEnum; //hex color string, enum
	icon?: MixerEnum; //enum
	source?: {
		type: MixerEnum; //enum
		index: MixerIndex;
	};
	delay?: {
		time: MixerLinear; //ms
		on?: MixerBoolean;
	};
	preamp?: {
		gain?: MixerLinear; //db
		trim?: MixerLinear; //db
		invert?: MixerBoolean;
	};
	mute: MixerBoolean;
	level: MixerLevel; //db
	pan?: MixerLinear; //%
	width?: MixerLinear; //%
	custom?: MixerNode;
	eq?: {
		filters?: {
			//dedicated filters
			hp?: {
				freq: MixerExponential; //Hz
				slope: MixerLinear;
				on: MixerBoolean;
			};
			lp?: {
				freq: MixerExponential; //Hz
				slope: MixerLinear;
				on: MixerBoolean;
			};
		};
		bands?: {
			type: MixerEnum;
			gain?: MixerLinear; //db
			freq: MixerExponential; //Hz
			q: MixerLinear; //q or slope
			on: MixerBoolean;
		};
	};
	dyn1?: MixerDynamicsPlugin;
	dyn2?: MixerDynamicsPlugin;
	order: MixerEnum[]; //order of processing. Input is always first
	ins1?: MixerNode;
	ins2?: MixerNode;
	send?: {
		type: MixerStripType;
		index: MixerIndex;
		on: MixerBoolean;
		level: MixerLevel; //db
		tap: MixerEnum; //index of channel strip order that tap is after
		pan?: MixerLinear; //%
		panFollow: MixerBoolean;
	}[];
	main?: {
		type: MixerStripType;
		index: MixerIndex;
		level?: MixerLevel; //db
		on?: MixerBoolean;
	}[];
	dca: MixerBoolean[];
	mutegroup: MixerBoolean[];
};
type MixerDca = {
	name?: MixerString;
	color?: MixerEnum; //hex color string, enum
	icon?: MixerEnum; //enum
	mute: MixerBoolean;
	level: MixerLevel; //db
};
type MixerMuteGroup = {
	name?: MixerString;
	color?: MixerEnum; //hex color string, enum
	icon?: MixerEnum; //enum
	on: MixerBoolean;
};
type MixerLayer = {
	name: MixerString;
	assigned: ({
		_key: MixerKey;
	} & (
		| {
				on: {
					_type: 'boolean';
					value: true;
				};
				type: MixerStripType;
				index: MixerIndex;
		  }
		| {
				on: {
					_type: 'boolean';
					value: false;
				};
		  }
	))[];
};
type MixerIcons = {
	[k: string]: MixerString; //name: base64 image
};

type MixerNode =
	| { [k: string]: MixerNode | MixerLeaf }
	| MixerNode[]
	| MixerLeaf[];

type MixerDynamicsPlugin = (
	| {
			type: {
				_type: 'enum';
				value: 'comp' | 'exp';
				enum: MixerDynamicsPlugin['type']['value'][];
			};
			custom: MixerNode;
			env: {
				_type: 'enum';
				value: 'lin' | 'log';
				enum: ['lin', 'log'];
			};
			knee: MixerLinear;
			mgain: MixerLinear; //db
			thr: MixerExponential; //db
			auto?: MixerBoolean;
			att?: MixerLinear; //ms
			hold?: MixerLinear; //ms
			rel?: MixerLinear; //ms
			ratio: MixerExponential;
	  }
	| {
			type: {
				_type: 'enum';
				value: 'gate' | 'duck';
				enum: MixerDynamicsPlugin['type']['value'][];
			};
			custom: MixerNode;
			env: {
				_type: 'enum';
				value: 'lin' | 'log';
				enum: ['lin', 'log'];
			};
			thr: MixerExponential; //db
			auto?: MixerBoolean;
			att?: MixerLinear; //ms
			hold?: MixerLinear; //ms
			rel?: MixerLinear; //ms
			range: MixerLinear;
	  }
	| {
			type: {
				_type: 'enum';
				value: 'other';
				enum: MixerDynamicsPlugin['type']['value'][];
			};
			custom: MixerNode;
	  }
) & {
	on: MixerBoolean;
	custom?: MixerNode;
	sideChain?: {
		srcType: MixerStripType;
		srcIndex: MixerIndex;
		srcTap: MixerEnum;
		filter?: {
			on: MixerBoolean;
			type: {
				_type: 'enum';
				value: 'bandpass' | 'lowpass' | 'highpass';
				enum: ('bandpass' | 'lowpass' | 'highpass')[];
			};
			freq: MixerExponential; //Hz
			q?: MixerLinear; //q or slope
		};
	};
};
