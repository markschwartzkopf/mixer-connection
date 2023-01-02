import { MixerObject } from '../types';

export type MixerLeafError = { _type: 'error'; error: string };

export type MixerLeaf =
	| MixerEnum
	| MixerString
	| MixerLevel
	| MixerLinear
	| MixerExponential
	| MixerIndex
	| MixerBoolean
	| MixerStripType
  | MixerKey;

export class MixerEnum {
	readonly _type = 'enum';
	value: string; //default is first element of enum
	readonly enum: string[];
	constructor(values: string[], value?: string) {
		if (values.length === 0) {
			values = [''];
			console.error('MixerEnum must have at least one possible value');
		}
		this.enum = values;
		this.value = value !== undefined ? value : values[0];
	}
}
export class MixerString {
	readonly _type = 'string';
	value: string; //default is ''
	constructor(value?: string) {
		this.value = value ? value : '';
	}
}
export class MixerLevel {
	readonly _type = 'level';
	value: number | '-oo'; //default is '-oo'
	readonly max: number;
	constructor(max: number, value?: MixerLevel['value']) {
		this.max = max;
		if (!value) value = '-oo';
		if (typeof value === 'number' && value > max) {
			console.error('MixerLevel value can not be higher than max');
			value = '-oo';
		}
		this.value = value;
	}
}
export class MixerLinear {
	readonly _type = 'linear';
	value: number; //default is default | min
	readonly default: number;
	readonly min: number;
	readonly max: number;
	constructor(
		min: number,
		max: number,
		...dV:
			| [{ default: number }, number]
			| [number, { default: number }]
			| [number]
			| [{ default: number }]
			| []
	) {
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
			console.error('MixerLinear default must be between min and max');
			dfault = min;
		}
		this.default = min;
		if (!value) value = dfault;
		if (value > max || value < min) {
			console.error('MixerLinear value must be between min and max');
			value = dfault;
		}
		this.value = value;
	}
}
export class MixerExponential {
	readonly _type = 'exponential';
	value: number; //default is default | min
	readonly default: number;
	readonly min: number;
	readonly max: number;
	constructor(
		min: number,
		max: number,
		...dV:
			| [{ default: number }, number]
			| [number, { default: number }]
			| [number]
			| [{ default: number }]
			| []
	) {
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
			console.error('MixerExponential default must be between min and max');
			dfault = min;
		}
		this.default = min;
		if (!value) value = dfault;
		if (value > max || value < min) {
			console.error('MixerExponential value must be between min and max');
			value = dfault;
		}
		this.value = value;
	}
}
export class MixerIndex {
	readonly _type = 'index';
	value: number; //default 1
	readonly max: number;
	constructor(max: number, value?: number) {
		if (max !== Math.round(max)) {
			console.error('MixerIndex max must be integer');
			max = Math.round(max);
		}
		if (max < 1) {
			console.error('MixerIndex max must be 1 or larger');
			max = 1;
		}
		this.max = max;
		if (!value) value = 1;
		if (value !== Math.round(value)) {
			console.error('MixerIndex value must be integer');
			value = Math.round(value);
		}
		if (value > max || value < 1) {
			console.error('MixerIndex value must be between 1 and max');
			value = 1;
		}
		this.value = value;
	}
}
export class MixerBoolean {
	readonly _type = 'boolean';
	value: boolean;
	constructor(value?: boolean) {
		this.value = !!value;
	}
}
export class MixerStripType {
	readonly _type = 'stripType';
	value: keyof MixerObject['strips'];
	constructor(value?: keyof MixerObject['strips']) {
		this.value = value ? value : 'ch';
	}
}
export class MixerKey {
	readonly _type = 'key';
	value: string;
	constructor(value: string) {
		this.value = value;
	}
}
