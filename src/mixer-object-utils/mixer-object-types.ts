import { NodeValue } from "../types";

export type NodeChildren<T extends MetaNode> = ChildrenToNodes<MetaNodeToChildren<T>>;

type ChildToNode<T> = T extends MetaNode
  ? NodeChildren<T>
  : T extends MixerLeaf<string>
  ? string
  : T extends MixerLeaf<number>
  ? number
  : T extends MixerLeaf<boolean>
	? boolean
	: never

type MetaNodeToChildren<T extends MetaNode> = {
  [prop in keyof T['children']]: T['children'][prop];
};

type ChildrenToNodes<T extends { [k: string | number]: MetaNode | MixerLeaf<any> }> = {
	[prop in keyof T]: ChildToNode<T[prop]>;
}

export interface MetaNode {
  readonly address: string[];
  readonly children: { [k: string | number]: MetaNode | MixerLeaf<any> };
  //getObject: nodeChildren<MetaNode>;
}

export class MetaNode {
  readonly address: string[] = [];
  readonly children: { [k: string | number]: MetaNode | MixerLeaf<any> } = {};
  get getObject(): NodeChildren<typeof this> {
    return getObject<typeof this>(this.children);
  }

  //getMetaObject: ?
}

export function getObject<T extends MetaNode>(
  children: T['children']
): NodeChildren<T> {
  const rtn: Partial<NodeChildren<T>> = {};
  Object.keys(children).forEach((key) => {
    const prop = key as keyof NodeChildren<T>;
    const child = children[prop];
    rtn[prop] = child.getObject as NodeChildren<T>[keyof NodeChildren<T>];
  });
  return rtn as NodeChildren<T>;
}

export interface MixerLeaf<V extends NodeValue> {
	readonly _type: string;
	readonly address: string[];
  value: V;
  getObject: V;
}




export class MixerLeafEnum<T extends string> implements MixerLeaf<string> {
	readonly _type = 'enum';
	readonly address: string[];
	value: T; //default is first element of enum
	readonly enum: T[];
	constructor(address: string[], values: T[], value?: T) {
		this.address = address;
		if (values.length === 0) {
			console.error('MixerLeafEnum must have at least one possible value');
		}
		this.enum = values;
		this.value = value !== undefined ? value : values[0];
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: T) {
		this.value = val;
	}
}
export class MixerLeafKey<T extends string, S extends T> implements MixerLeaf<string> {
	readonly _type = 'key';
	readonly address: string[];
	readonly value: T; //Cannot be changed within this object. Must be changed by rebuilding the MixerKey's parent from scratch.
	readonly enum: T[];
	constructor(address: string[], values: T[], value: S) {
		this.address = address;
		if (values.length === 0) {
			console.error('MixerLeafKey must have at least one possible value');
		}
		this.enum = values;
		this.value = value !== undefined ? value : values[0];
	}
	get getObject() {
		return this.value;
	}
	/** Needs to trigger rebuild of parent object */
	set getObject(val: T) {
		return; 
	}
}
export class MixerLeafString implements MixerLeaf<string>{
	readonly _type = 'string';
	readonly address: string[];
	value: string; //default is ''
	constructor(address: string[], value?: string) {
		this.address = address;
		this.value = value ? value : '';
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: string) {
		return; 
	}
}
export class MixerLeafLevel implements MixerLeaf<number>{
	readonly _type = 'level';
	readonly address: string[];
	value: number; 
	readonly max: number;
	constructor(address: string[], max: number, value?: number) {
		this.address = address;
		this.max = max;
		if (!value) value = -Infinity;
		if (typeof value === 'number' && value > max) {
			console.error('MixerLeafLevel value can not be higher than max');
			value = -Infinity;
		}
		this.value = value;
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: number) {
		return; 
	}
}
export class MixerLeafLinear implements MixerLeaf<number> {
	readonly _type = 'linear';
	readonly address: string[];
	value: number; //default is default | min
	readonly default: number;
	readonly min: number;
	readonly max: number;
	constructor(
		address: string[],
		min: number,
		max: number,
		...dV:
			| [{ default: number }, number]
			| [number, { default: number }]
			| [number]
			| [{ default: number }]
			| []
	) {
		this.address=address;
		this.max = max;
		this.min = min;
		let value: number | undefined = undefined;
		let dfault: number | undefined = undefined;
		for (let i = 0; i < dV.length; i++) {
			const arg = dV[i];
			if (typeof arg === 'number') {
				value = arg;
			} else dfault = arg.default;
		}
		if (!dfault) dfault = min;
		if (dfault > max || dfault < min) {
			console.error('MixerLeafLinear default must be between min and max');
			dfault = min;
		}
		this.default = min;
		if (!value) value = dfault;
		if (value > max || value < min) {
			console.error('MixerLeafLinear value must be between min and max');
			value = dfault;
		}
		this.value = value;
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: number) {
		return; 
	}
}
export class MixerLeafExponential implements MixerLeaf<number>{
	readonly _type = 'exponential';
	readonly address: string[];
	value: number; //default is default | min
	readonly default: number;
	readonly min: number;
	readonly max: number;
	constructor(
		address: string[],
		min: number,
		max: number,
		...dV:
			| [{ default: number }, number]
			| [number, { default: number }]
			| [number]
			| [{ default: number }]
			| []
	) {
		this.address = address;
		this.max = max;
		this.min = min;
		let value: number | undefined = undefined;
		let dfault: number | undefined = undefined;
		for (let i = 0; i < dV.length; i++) {
			const arg = dV[i];
			if (typeof arg === 'number') {
				value = arg;
			} else dfault = arg.default;
		}
		if (!dfault) dfault = min;
		if (dfault > max || dfault < min) {
			console.error('MixerLeafExponential default must be between min and max');
			dfault = min;
		}
		this.default = min;
		if (!value) value = dfault;
		if (value > max || value < min) {
			console.error('MixerLeafExponential value must be between min and max');
			value = dfault;
		}
		this.value = value;
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: number) {
		return; 
	}
}
export class MixerLeafIndex implements MixerLeaf<number> {
	readonly _type = 'index';
	readonly address: string[];
	value: number; //default 0
	readonly max: number;
	/** 0 means unnassigned */
	constructor(address: string[], max: number, value?: number) {
		this.address = address;
		if (max !== Math.round(max)) {
			console.error('MixerLeafIndex max must be integer');
			max = Math.round(max);
		}
		if (max < 0) {
			console.error('MixerLeafIndex max must be 0 or larger');
			max = 0;
		}
		this.max = max;
		if (!value) value = 0;
		if (value !== Math.round(value)) {
			console.error('MixerLeafIndex value must be integer');
			value = Math.round(value);
		}
		if (value > max || value < 0) {
			console.error('MixerLeafIndex value must be between 0 and max');
			value = 0;
		}
		this.value = value;
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: number) {
		return; 
	}
}
export class MixerLeafBoolean implements MixerLeaf<boolean> {
	readonly _type = 'boolean';
	readonly address: string[];
	value: boolean;
	constructor(address: string[], value?: boolean) {
		this.address = address;
		this.value = !!value;
	}
	get getObject() {
		return this.value;
	}
	set getObject(val: boolean) {
		return; 
	}
}