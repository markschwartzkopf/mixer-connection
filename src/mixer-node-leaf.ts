export class MixerLeaf<T extends MixerDefLeaf> {
	private _value: T['default'];
	readonly type: T['_type'];
	readonly mixerAddress: string[];
	constructor(
		readonly definition: T,
		readonly parent: MixerNode,
		readonly address: string[],
		readonly mixerNumber?: string
	) {
		this._value = definition.default;
		this.type = definition._type;
		const processedAddress: string[] = [
			mixerNumber ? mixerNumber : address[address.length - 1],
		];
		let node: MixerNode | MixerLeaf<MixerDefLeaf> | null = this;
		while (node.parent) {
			processedAddress.unshift(
				node.mixerNumber
					? node.mixerNumber
					: node.address[node.address.length - 1]
			);
			node = node.parent;
		}
		this.mixerAddress = this.definition.mixerAddress.map((x) => {
			if (typeof x === 'number') {
				return processedAddress[x - 1];
			} else return x;
		});
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
	readonly mixerNumber?: string;
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

export type MixerDefLeafBoolean = {
	mixerAddress: MixerAddress;
	mixerInfo?: any;
	_type: 'boolean';
	default: boolean;
};

export type MixerDefLeafString = {
	mixerAddress: MixerAddress;
	mixerInfo?: any;
	_type: 'string';
	default: string;
	maxLength?: number;
};

export type MixerDefLeafEnum = {
	mixerAddress: MixerAddress;
	mixerInfo?: any;
	_type: 'enum';
	values: string[];
	default: number;
};

export type MixerDefLeafNumber = {
	mixerAddress: MixerAddress;
	mixerInfo?: any;
	_type: 'number';
	default: number;
	min: number;
	max: number;
	tag?: 'exponential' | 'logarithmic' | 'integer';
};

export type LeafValue = MixerLeaf<MixerDefLeaf>['value'];

export function getNodeValue(node: MixerNode): ValueNode {
	const rtn: ValueNode = {};
	for (const prop in node.children)
		rtn[prop] =
			node.children[prop].type === 'node'
				? getNodeValue(node.children[prop] as MixerNode)
				: (node.children[prop] as MixerLeaf<MixerDefLeaf>).value;
	return rtn;
}

/* export function getValueAddressPairs(
	node: MixerNode | MixerLeaf<MixerDefLeaf>,
	val: ValueNode | LeafValue
): [LeafValue, string[]][] | string {
	const rtn: [LeafValue, string[]][] = [];
	if (node.type === 'node') {
		if (typeof val === 'object') {
			for (const [prop, childVal] of Object.entries(val)) {
				const child = node.children[prop];
				if (child) {
					const childPairs = getValueAddressPairs(child, childVal);
					if (typeof childPairs === 'string') return childPairs;
					rtn.push(...childPairs);
				} else
					return `Node /${[...node.address, prop].join('/')} does not exist`;
			}
		} else
			return `Cannot assign primitive type to node /${node.address.join('/')}`;
	} else {
		if (typeof val !== 'object') {
			const valType = typeof val;
			switch (node.type) {
				case 'boolean':
					if (valType === 'boolean') {
						return [[val, node.address]];
					} else
						return `Cannot assign ${valType} to ${
							node.type
						} node /${node.address.join('/')}`;
					break;
				case 'enum':
					console.error('Enum not verified! Fix this code!');
					if (valType === 'string') {
						return [[val, node.address]];
					} else
						return `Cannot assign ${valType} to ${
							node.type
						} node /${node.address.join('/')}`;
					break;
				case 'string':
					if (valType === 'string') {
						return [[val, node.address]];
					} else
						return `Cannot assign ${valType} to ${
							node.type
						} node /${node.address.join('/')}`;
					break;
				case 'number':
					if (valType === 'number') {
						return [[val, node.address]];
					} else
						return `Cannot assign ${valType} to ${
							node.type
						} node /${node.address.join('/')}`;
					break;
				default:
					return `Mixer leaf type ${
						(node as MixerLeaf<MixerDefLeaf>).type
					} cannot be assigned`;
					break;
			}
		} else
			return `Cannot assign node type to primitive /${node.address.join('/')}`;
	}
	return rtn;
} */

export type ValueNode = {
	[k: string]: ValueNode | LeafValue | [null, ...(ValueNode[] | LeafValue[])];
};

type MixerAddress = (string | number)[];
