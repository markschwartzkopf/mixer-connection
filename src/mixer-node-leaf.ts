export class MixerLeaf {
	private _value: MixerDefLeaf['default'];
	readonly type: MixerDefLeaf['_type'];
	readonly nativeAddresses: string[][];
	/* state: LeafValue = new Proxy(this as any, {
		get(target, prop) {
			return target._value;
		},
		ownKeys(target) {
			return [];
		},
	}); */

	constructor(
		readonly definition: MixerDefLeaf,
		readonly address: string[],
		readonly parent: MixerNode,
		readonly mixerEngine: MixerEngine,
		readonly error: (err: string) => void,
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
		this.nativeAddresses = this.definition.nativeAddresses.map((address) => {
			return address.map((x) => {
				if (typeof x === 'number') {
					return processedAddress[x - 1];
				} else return x;
			});
		});
		this.mixerEngine.nativeTreeTranslator.add(
			this.nativeAddresses,
			this.address
		);
		(this.parent.stateTree as any)[this.address.slice(-1)[0]] =
			definition.default; //typescript gymnastics because NodeArrays exist
	}
	get state() {
		return this._value;
	}
	set state(val: LeafValue) {
		this.mixerEngine.setMixer(this.getSettingAddressesAndValues(val));
	}

	update(address: string[], val: LeafValue) {
		if (address.length !== 0) {
			this.error(
				`Bad address for update from mixer, encountered at node ${this.address.join(
					'/'
				)}`
			);
			return;
		}
		const newVal = this._valueValid(val);
		if (newVal !== null) this._value = val;
		(this.parent.stateTree as any)[this.address.slice(-1)[0]] = val; //typescript gymnastics because NodeArrays exist
	}

	private _valueValid(val: NodeValue | LeafValue) {
		if (typeof val === 'object') {
			this.error(
				`Cannot set leaf ${this.address.join('/')} to leaf node value`
			);
			return null;
		}
		switch (this.definition._type) {
			case 'boolean':
				if (typeof val !== 'boolean') {
					this.error(
						`Cannot set leaf ${this.address.join('/')} to ${typeof val} value`
					);
					return null;
				}
				break;
			case 'enum':
				if (typeof val !== 'string') {
					this.error(
						`Cannot set leaf ${this.address.join('/')} to ${typeof val} value`
					);
					return null;
				}
				if (!this.definition.values.includes(val)) {
					this.error(
						`Cannot set enum leaf ${this.address.join('/')} to ${val}`
					);
					return null;
				}
				break;
			case 'number':
				if (typeof val !== 'number') {
					this.error(
						`Cannot set leaf ${this.address.join('/')} to ${typeof val} value`
					);
					return null;
				}
				if (val > this.definition.max) {
					this.error(
						`Cannot set leaf ${this.address.join('/')} to value larger than ${
							this.definition.max
						}`
					);
					return null;
				}
				if (val < this.definition.min) {
					this.error(
						`Cannot set leaf ${this.address.join('/')} to value smaller than ${
							this.definition.min
						}`
					);
					return null;
				}
				break;
			case 'string':
				if (typeof val !== 'string') {
					this.error(
						`Cannot set leaf ${this.address.join('/')} to ${typeof val} value`
					);
					return null;
				}
				if (
					this.definition.maxLength &&
					val.length > this.definition.maxLength
				) {
					const oldVal = val;
					val = val.slice(0, this.definition.maxLength);
					this.error(
						`Lead ${this.address.join('/')} has a max length of ${
							this.definition.maxLength
						}. Truncating ${oldVal} to ${val}`
					);
				}
				break;
		}
		return val;
	}

	getSettingAddressesAndValues(
		nodeValue: NodeValue | LeafValue
	): [string[], LeafValue][] {
		const val = this._valueValid(nodeValue);
		if (val !== null) {
			return this.nativeAddresses.map((address) => {
				return [address, val];
			});
		} else return [];
	}
}

export class MixerNode {
	readonly type = 'node';
	readonly children: { [k: string]: MixerNode | MixerLeaf };
	readonly isArray: boolean;
	readonly _stateProxy: NodeValue;

	constructor(
		def: MixerDefNode | MixerDefArray,
		readonly address: string[],
		readonly parent: MixerNode | null,
		readonly stateTree: NodeValue,
		readonly mixerEngine: MixerEngine,
		readonly error: (err: string) => void,
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
					const newStateTreeNode: NodeValue =
						arrayDef.items._type === 'array' ? [null] : {};
					(this.stateTree as ArrayValue).push(newStateTreeNode);
					this.children[prop] = new MixerNode(
						arrayDef.items,
						[...address, prop],
						this,
						newStateTreeNode,
						mixerEngine,
						error,
						childMixerNumber
					);
				} else {
					this.children[prop] = new MixerLeaf(
						arrayDef.items as MixerDefLeaf,
						[...address, prop],
						this,
						mixerEngine,
						error,
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
							const newStateTreeNode: NodeValue =
								definition._type === 'array' ? [null] : {};
							(this.stateTree as any)[prop] = newStateTreeNode;
							return [
								prop,
								new MixerNode(
									definition,
									[...address, prop],
									this,
									newStateTreeNode,
									mixerEngine,
									error
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
									mixerEngine,
									error
								),
							];
						}
					}
				)
			);
		}
		const self = this;
		this._stateProxy = new Proxy(this.stateTree, {
			get(target, prop) {
				if (prop === 'toJSON') return {};
				if (typeof prop !== 'string' || !self.children[prop]) {
					if (typeof prop === 'string' && prop in target)
						return (target as any)[prop];
					self.error(
						`Property ${String(
							prop
						)} does not exist on node ${self.address.join('/')}`
					);
					return {};
				}
				return self.children[prop].state;
			},
			set(target, prop, val) {
				if (typeof prop !== 'string' || !self.children[prop]) {
					self.error(
						`Property ${String(
							prop
						)} does not exist on node ${self.address.join('/')}`
					);
					return true;
				}
				self.children[prop].state = val;
				return true;
			},
			ownKeys() {
				return Object.keys(self.children);
			},
			getOwnPropertyDescriptor() {
				return {
					enumerable: true,
					configurable: true,
				};
			},
		});
	}

	get state() {
		return this._stateProxy;
	}
	set state(val: NodeValue) {
		const test = this.getSettingAddressesAndValues(val);
		//FAILS after this point
		this.mixerEngine.setMixer(test);
		//this.mixerEngine.setMixer(this.getSettingAddressesAndValues(val));
	}

	update(address: string[], val: LeafValue) {
		const prop = address[0];
		if (prop !== undefined && this.children[prop]) {
			this.children[prop].update(address.slice(1), val);
		} else {
			this.error(
				`Bad address for update from mixer, encountered at node ${this.address.join(
					'/'
				)}`
			);
		}
	}

	getSettingAddressesAndValues(
		nodeValue: NodeValue | LeafValue
	): [string[], LeafValue][] {
		if (typeof nodeValue !== 'object') {
			this.error(
				`Cannot set node ${this.address.join(
					'/'
				)} to leaf type value ${nodeValue}`
			);
			return [];
		}
		const rtn: [string[], LeafValue][] = [];
		for (const [prop, val] of Object.entries(nodeValue)) {
			if (val !== null) {
				const child = this.children[prop];
				if (!child) {
					this.error(`Node ${this.address.join('/')} has no child "${prop}"`);
				} else rtn.push(...child.getSettingAddressesAndValues(val));
			}
		}
		return rtn;
	}
}

export interface MixerDefNode {
	[k: string]: MixerDefNode | MixerDefLeaf | MixerDefArray | never;
}

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
	nativeAddresses: NativeAddresses;
	mixerInfo?: any;
	_type: 'boolean';
	default: boolean;
};

export type MixerDefLeafString = {
	nativeAddresses: NativeAddresses;
	mixerInfo?: any;
	_type: 'string';
	default: string;
	maxLength?: number;
};

export type MixerDefLeafEnum = {
	nativeAddresses: NativeAddresses;
	mixerInfo?: any;
	_type: 'enum';
	values: string[];
	default: string;
};

export type MixerDefLeafNumber = {
	nativeAddresses: NativeAddresses;
	mixerInfo?: any;
	_type: 'number';
	default: number;
	min: number;
	max: number;
	tag?: 'exponential' | 'logarithmic' | 'integer';
};

export type LeafValue = MixerLeaf['_value'];

export class TreeTranslator {
	readonly tree: NativeTree = {};

	constructor(readonly error: (err: string) => void) {}

	add(nativeAddresses: string[][], localAddress: string[]) {
		addToTree(this.tree, nativeAddresses, localAddress, this.error);
	}

	nativeAddressToLocal(nativeAddress: string[]): string[][] {
		let tree: NativeTree | string[][] = this.tree;
		const workingAddress = [...nativeAddress];
		while (workingAddress.length > 1) {
			const prop = workingAddress.shift();
			if (prop && !Array.isArray(tree) && tree[prop]) {
				tree = tree[prop];
			} else {
				this.error(`Unknown native mixer address ${nativeAddress.join('/')}`);
				return [['MISSING_ADDRESS']];
			}
		}
		if (nativeAddress.length < 1) {
			this.error('Cannot convert empty native address to local address');
			return [['MISSING_ADDRESS']];
		}
		if (Array.isArray(tree)) {
			this.error(`Unknown native mixer address ${nativeAddress.join('/')}`);
			return [['MISSING_ADDRESS']];
		}
		const localAddresses = tree[workingAddress[0]];
		if (Array.isArray(localAddresses)) {
			return localAddresses;
		} else return [['MISSING_ADDRESS']];
	}
}

function addToTree(
	tree: NativeTree,
	nativeAddresses: string[][],
	localAddress: string[],
	error: (err: string) => void
) {
	nativeAddresses.forEach((nativeAddress) => {
		const currentProp = nativeAddress[0];
		if (!tree[currentProp]) {
			if (nativeAddress.length === 1) {
				tree[currentProp] = [localAddress];
				return;
			}
			tree[currentProp] = {};
		}
		if (nativeAddress.length === 1) {
			const addressList = tree[currentProp];
			if (Array.isArray(addressList)) {
				addressList.push(localAddress);
			} else error(`Error: ${currentProp} is both a node and a leaf`);
			return;
		}
		addToTree(
			tree[currentProp] as NativeTree,
			[nativeAddress.slice(1)],
			localAddress,
			error
		);
	});
}

export type NativeTree = {
	[k: string]: NativeTree | string[][];
};

export type NodeValue =
	| {
			[k: string]: NodeValue | LeafValue | ArrayValue;
	  }
	| ArrayValue;

type ArrayValue = [null, ...(NodeValue | LeafValue | ArrayValue)[]];

type NativeAddresses = (string | number)[][];

export interface mixerEvents {
	error: (err: string) => void;
	closed: () => void;
	info: (info: string) => void;
	connected: () => void;
}

export interface MixerEngine {
	on<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	once<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	off<U extends keyof mixerEvents>(event: U, listener: mixerEvents[U]): this;
	emit<U extends keyof mixerEvents>(event: U, ...args: Parameters<mixerEvents[U]>): boolean;
	setMixer: (values: [string[], LeafValue][]) => void;
	nativeTreeTranslator: TreeTranslator;
}
