export class MixerLeaf {
	private _value: MixerDefLeaf['default'];
	readonly type: MixerDefLeaf['_type'];
	readonly localAddress: string[];
	constructor(
		readonly definition: MixerDefLeaf,
		readonly address: string[],
		readonly parent: MixerNode,
		nativeTreeTranslator: TreeTranslator,
		readonly mixerNumber?: string
	) {
		this._value = definition.default;
		this.type = definition._type;
		const processedAddress: string[] = [
			mixerNumber ? mixerNumber : address[address.length - 1],
		];
		let node: MixerNode | MixerLeaf | null = this;
		while (node.parent) {
			processedAddress.unshift(
				node.mixerNumber
					? node.mixerNumber
					: node.address[node.address.length - 1]
			);
			node = node.parent;
		}
		this.localAddress = this.definition.localAddress.map((x) => {
			if (typeof x === 'number') {
				return processedAddress[x - 1];
			} else return x;
		});
		nativeTreeTranslator.add(this.localAddress, this.address);
	}
	get value() {
		return this._value;
	}
	set value(val: MixerDefLeaf['default']) {
		this._value = val;
	}
}

export class MixerNode {
	readonly type = 'node';
	readonly children: { [k: string]: MixerNode | MixerLeaf };
	readonly isArray: boolean;

	constructor(
		def: MixerDefNode | MixerDefArray,
		readonly address: string[],
		readonly parent: MixerNode | null,
		nativeTreeTranslator: TreeTranslator,
		readonly mixerNumber?: string
	) {
		if (def._type === 'array') {
			const arrayDef = def as MixerDefArray;
			this.isArray = true;
			this.children = {};
			let index = 0;
			const indexDigits = arrayDef.indexDigits ? arrayDef.indexDigits : 0;
			for (
				let mixerIndex = arrayDef.start ? arrayDef.start : 1;
				mixerIndex <= arrayDef.end;
				mixerIndex++
			) {
				index++;
				const prop = index.toString();
				const childMixerNumber = mixerIndex
					.toString()
					.padStart(indexDigits, '0');
				if (!arrayDef.items._type || arrayDef.items._type === 'array') {
					this.children[prop] = new MixerNode(
						arrayDef.items,
						[...address, prop],
						this,
						nativeTreeTranslator,
						childMixerNumber
					);
				} else {
					this.children[prop] = new MixerLeaf(
						arrayDef.items as MixerDefLeaf,
						[...address, prop],
						this,
						nativeTreeTranslator,
						childMixerNumber
					);
				}
			}
		} else {
			this.isArray = false;
			this.children = Object.fromEntries(
				Object.entries(def as MixerDefNode).map(
					([prop, definition]: [
						string,
						MixerDefNode | MixerDefLeaf | MixerDefArray
					]) => {
						if (!definition._type || definition._type === 'array') {
							return [
								prop,
								new MixerNode(
									definition,
									[...address, prop],
									this,
									nativeTreeTranslator
								),
							];
						} else {
							const leafDef = definition as MixerDefLeaf;
							return [
								prop,
								new MixerLeaf(
									leafDef,
									[...address, prop],
									this,
									nativeTreeTranslator
								),
							];
						}
					}
				)
			);
		}
	}
}

export type MixerDefNode = {
	[k: string]: MixerDefNode | MixerDefLeaf | MixerDefArray;
};

export type MixerDefArray = {
	_type: 'array';
	start?: number;
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
	localAddress: LocalAddress;
	mixerInfo?: any;
	_type: 'boolean';
	default: boolean;
};

export type MixerDefLeafString = {
	localAddress: LocalAddress;
	mixerInfo?: any;
	_type: 'string';
	default: string;
	maxLength?: number;
};

export type MixerDefLeafEnum = {
	localAddress: LocalAddress;
	mixerInfo?: any;
	_type: 'enum';
	values: string[];
	default: number;
};

export type MixerDefLeafNumber = {
	localAddress: LocalAddress;
	mixerInfo?: any;
	_type: 'number';
	default: number;
	min: number;
	max: number;
	tag?: 'exponential' | 'logarithmic' | 'integer';
};

export type LeafValue = MixerLeaf['value'];

export function getNodeValue(node: MixerNode): ValueNode {
	let rtn: ValueNode = {};
	if (node.isArray) {
		rtn = [null];
		for (const prop in node.children)
			rtn[parseInt(prop)] =
				node.children[prop].type === 'node'
					? getNodeValue(node.children[prop] as MixerNode)
					: (node.children[prop] as MixerLeaf).value;
	} else
		for (const prop in node.children)
			rtn[prop] =
				node.children[prop].type === 'node'
					? getNodeValue(node.children[prop] as MixerNode)
					: (node.children[prop] as MixerLeaf).value;
	return rtn;
}

export function getSettingAddressesAndValues(
	node: MixerNode,
	valueNode: ValueNode
): string | [string[], LeafValue][] {
	const rtn: [string[], LeafValue][] = [];
	for (const [prop, val] of Object.entries(valueNode)) {
		if (val !== null) {
			const child = node.children[prop];
			if (!child)
				return `Incorrect value format for this tree, at address ${node.address.join(
					'/'
				)}`;
			if (child.type === 'node') {
				if (typeof val !== 'object')
					return `Incorrect value format for this tree, at address ${node.address.join(
						'/'
					)}`;
				const childAddresses = getSettingAddressesAndValues(child, val);
				if (typeof childAddresses === 'string') return childAddresses;
				rtn.push(...childAddresses);
			} else {
				if (typeof val === 'object')
					return `Incorrect value format for this tree, at address ${node.address.join(
						'/'
					)}`;
				rtn.push([child.localAddress, val]);
			}
		}
	}
	return rtn;
}

export class TreeTranslator {
	readonly tree: NativeTree = {};

	add(nativeAddress: string[], localAddress: string[]) {
		addToTree(this.tree, nativeAddress, localAddress);
	}
}

function addToTree(
	tree: NativeTree,
	nativeAddress: string[],
	localAddress: string[]
) {
	const currentProp = nativeAddress[0];
	if (!tree[currentProp]) {
		if (nativeAddress.length === 1) {
			tree[currentProp] = localAddress;
			return;
		}
		tree[currentProp] = {};
	}
	addToTree(
		tree[currentProp] as NativeTree,
		nativeAddress.slice(1),
		localAddress
	);
}

export type NativeTree = {
	[k: string]: NativeTree | string[];
};

export type ValueNode =
	| {
			[k: string]: ValueNode | LeafValue | ValueArray;
	  }
	| ValueArray;

type ValueArray = [null, ...(ValueNode | LeafValue | ValueArray)[]];

type LocalAddress = (string | number)[];
