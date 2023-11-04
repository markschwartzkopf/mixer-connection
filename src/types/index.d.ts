import { MixerRootNode } from '../proto-tree';

type MixerModel = 'XM32' | 'Xair' | 'Wing' | 'noMixer';

export interface MixerModule {
	close: () => void;
	status: MixerStatus;
	mixerTree: MixerRootNode;

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

type NodeValue = string | number | boolean;
type NodeObject = { [k: string]: NodeValue | NodeObject };

type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';

type MixerDefNode = {
	[k: string]: MixerDefNode | MixerDefLeaf | MixerDefArray;
};

type MixerDefArray = {
	_type: 'array';
	start: number;
	end: number;
	indexDigits?: number;
	items: MixerDefNode[string];
};

type MixerDefLeaf = MixerDefLeafBoolean | MixerDefLeafEnum | MixerDefLeafNumber;

type MixerDefLeafBoolean = { _type: 'boolean'; default: boolean };

type MixerDefLeafEnum = { _type: 'enum'; values: string[]; default: number };

type MixerDefLeafNumber = {
	_type: 'number';
	default: number;
	min: number;
	max: number;
	tag?: 'exponential' | 'logarithmic' | 'integer';
};
