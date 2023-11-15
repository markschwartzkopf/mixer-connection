//import { MixerLeaf } from '../mixer-leaf';

type MixerModel = import('../generated-mixer-nodes').MixerModel //'XM32' | 'Xair' | 'Wing' | 'noMixer';

/* export interface MixerModule {
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
type NodeObject = { [k: string]: NodeValue | NodeObject }; */

type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';

interface MixerNode {
  readonly type: 'node';
  readonly address: string[];
  readonly parent: MixerNode | null;
  readonly children: { [k: string]: MixerNode | import('../mixer-leaf').MixerLeaf<MixerDefLeaf> };
}

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

type MixerDefLeaf = MixerDefLeafBoolean | MixerDefLeafEnum | MixerDefLeafNumber | MixerDefLeafString;

type MixerDefLeafBoolean = { _type: 'boolean'; default: boolean };

type MixerDefLeafString = { _type: 'string'; default: string; maxLength?: number };

type MixerDefLeafEnum = { _type: 'enum'; values: string[]; default: number };

type MixerDefLeafNumber = {
	_type: 'number';
	default: number;
	min: number;
	max: number;
	tag?: 'exponential' | 'logarithmic' | 'integer';
};

/* type MixerLeaf = MixerStringLeaf | MixerNumberLeaf | MixerBooleanLeaf;

interface MixerStringLeaf {
  type: 'string';
  definition: { default: string };
  value: string;
}

interface MixerNumberLeaf {
  type: 'number';
  definition: { default: number };
  value: number;
}

interface MixerBooleanLeaf {
  type: 'boolean';
  definition: { default: boolean };
  value: boolean;
} */
