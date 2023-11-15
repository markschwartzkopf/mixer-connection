export class MixerLeaf<T extends MixerDefLeaf> {
	private _value: T['default'];
	readonly type: T['_type'];
	constructor(
		readonly definition: T,
		readonly parent: MixerNode,
		readonly address: string[]
	) {
		this._value = definition.default;
		this.type = definition._type;
	}
	get value() {
		return this._value;
	}
	set value(val: T['default']) {
		this._value = val;
	}
	/* get addresses() {
        return [[...this._address]]
    } */
}

export interface MixerNode {
	readonly type: 'node';
	readonly address: string[];
	readonly parent: MixerNode | null;
	readonly children: { [k: string]: MixerNode | MixerLeaf<MixerDefLeaf> };
}

export type MixerDefNode = {
	[k: string]: MixerDefNode | MixerDefLeaf | MixerDefArray;
};

export type MixerDefArray = {
	_type: 'array';
	start: number;
	end: number;
	indexDigits?: number;
	items: MixerDefNode[string];
};

export type MixerDefLeaf =
	| MixerDefLeafBoolean
	| MixerDefLeafEnum
	| MixerDefLeafNumber
	| MixerDefLeafString;

export type MixerDefLeafBoolean = { _type: 'boolean'; default: boolean };

export type MixerDefLeafString = {
	_type: 'string';
	default: string;
	maxLength?: number;
};

export type MixerDefLeafEnum = {
	_type: 'enum';
	values: string[];
	default: number;
};

export type MixerDefLeafNumber = {
	_type: 'number';
	default: number;
	min: number;
	max: number;
	tag?: 'exponential' | 'logarithmic' | 'integer';
};
