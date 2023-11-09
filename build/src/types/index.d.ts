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