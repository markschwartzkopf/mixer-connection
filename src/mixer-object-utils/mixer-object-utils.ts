import {
	MixerLeaf,
	MixerLeafError,
	MixerModule,
	MixerNode,
	NodeObject,
	NodeValue,
} from '../types';

export function getValFromNode(
	address: string[],
	node: MixerNode,
	withMeta: 'withMeta'
): MixerLeaf | MixerNode | MixerLeafError;
export function getValFromNode(
	address: string[],
	node: MixerNode
): NodeValue | NodeObject | null;
export function getValFromNode(
	address: string[],
	node: MixerNode,
	withMeta?: 'withMeta'
): NodeValue | NodeObject | null | MixerLeaf | MixerNode | MixerLeafError {
	let nodeOrLeaf: MixerNode | MixerLeaf | null = null;
	const first = address[0];
	address = address.slice(1);
	if (!first) {
		if (withMeta) {
			return node;
		} else return removeMeta(node);
	}
	if (Array.isArray(node)) {
		const index = parseInt(first);
		if (index) nodeOrLeaf = node[index - 1];
		if (!nodeOrLeaf) return { _type: 'error', error: 'bad array index' };
	} else {
		nodeOrLeaf = node[first];
	}
	if (!nodeOrLeaf)
		return { _type: 'error', error: `address ${first} does not exist` };
	if (address.length) {
		if (isLeaf(nodeOrLeaf)) {
			return { _type: 'error', error: 'address does not exist' };
		} else
			return withMeta
				? getValFromNode(address, nodeOrLeaf, withMeta)
				: getValFromNode(address, nodeOrLeaf);
	} else {
		if (withMeta) {
			return nodeOrLeaf;
		} else return removeMeta(nodeOrLeaf);
	}
}

export function isLeaf(
	maybeLeaf: MixerNode | MixerLeaf
): maybeLeaf is MixerLeaf {
	return !Array.isArray(maybeLeaf) && !!maybeLeaf._type;
}

export function isError(
	maybeLeaf: MixerNode | MixerLeaf | MixerLeafError
): maybeLeaf is MixerLeaf {
	return !Array.isArray(maybeLeaf) && maybeLeaf._type === 'error';
}

function removeMeta(nodeOrLeaf: MixerNode | MixerLeaf): NodeObject | NodeValue {
	if (isLeaf(nodeOrLeaf)) {
		return nodeOrLeaf.value;
	} else if (Array.isArray(nodeOrLeaf)) {
		return nodeOrLeaf.map(removeMeta as () => NodeValue);
	} else {
		const rtnObject: NodeObject = {};
		Object.keys(nodeOrLeaf).forEach((prop) => {
			rtnObject[prop] = removeMeta(nodeOrLeaf[prop]);
		});
		return rtnObject;
	}
}

export function cloneMixerNode(obj: CloneObj): any {
	if (Array.isArray(obj)) {
		const copy: CloneObj = [];
		for (let i = 0; i < obj.length; i++) {
			const element = obj[i];
			if (typeof element === 'object') {
				copy.push(cloneMixerNode(element));
			} else copy.push(element);
		}
		return copy;
	} else {
		const copy: CloneObj = {};
		Object.keys(obj).forEach((key) => {
			const prop = obj[key];
			if (typeof prop === 'object') {
				copy[key] = cloneMixerNode(prop);
			} else copy[key] = prop;
		});
		return copy;
	}
}

type CloneObj =
	| { [k: string]: CloneObj | string | number | boolean }
	| (CloneObj | string | number | boolean)[];

export function getAddressValuePairs(
	address: string[],
	value: NodeValue | NodeObject,
	module: MixerModule,
	node?: MixerNode | MixerLeaf,
	oAddress?: string[]
): { address: string[]; value: string | number | boolean }[] {
	if (!node) node = module.mixerObject;
	if (!oAddress) oAddress = [...address];
	const first = address[0];
	address = address.slice(1);
	if (!first) {
		if (typeof value === 'object') {
			if (isLeaf(node)) {
				module.emit(
					'error',
					new Error(`Can't assign object value to ${oAddress.join('/')}`)
				);
				return [];
			} else {
				console.log('code object val assignment');
				return [];
			}
		} else {
			if (isLeaf(node)) {
				switch (node._type) {
					case 'boolean':
						if (typeof value === 'boolean') {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${typeof value} to boolean type leaf ${oAddress.join(
										'/'
									)}`
								)
							);
							return [];
						}
						break;
					case 'enum':
						if (typeof value === 'string' && node.enum.indexOf(value) !== -1) {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${value} to enum type leaf ${oAddress.join(
										'/'
									)}. Possible values: ${node.enum.toString()}`
								)
							);
							return [];
						}
						break;
					case 'exponential':
						if (typeof value === 'number') {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${typeof value} to number type leaf ${oAddress.join(
										'/'
									)}`
								)
							);
							return [];
						}
						break;
					case 'index':
						if (typeof value === 'number') {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${typeof value} to number type leaf ${oAddress.join(
										'/'
									)}`
								)
							);
							return [];
						}
						break;
					case 'level':
						if (typeof value === 'number' || value === '-oo') {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${typeof value} to number type leaf ${oAddress.join(
										'/'
									)}`
								)
							);
							return [];
						}
						break;
					case 'linear':
						if (typeof value === 'number') {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${typeof value} to number type leaf ${oAddress.join(
										'/'
									)}`
								)
							);
							return [];
						}
						break;
					case 'string':
						if (typeof value === 'string') {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${typeof value} to string type leaf ${oAddress.join(
										'/'
									)}`
								)
							);
							return [];
						}
						break;
					case 'stripType':
						if (
							typeof value === 'string' &&
							Object.keys(module.mixerObject.strips).indexOf(value) !== -1
						) {
							return [{ address: oAddress, value: value }];
						} else {
							module.emit(
								'error',
								new Error(
									`Attempted to assign ${value} to channel strip type leaf ${oAddress.join(
										'/'
									)}. Possible values: ${Object.keys(
										module.mixerObject.strips
									).toString()}`
								)
							);
							return [];
						}
						break;
					default:
						module.emit(
							'error',
							new Error(`Type not implemented. Fix nomixer.ts`)
						);
						return [];
						break;
				}
			} else {
				module.emit(
					'error',
					new Error(`Only NodeObjects can be assigned to ${oAddress.join('/')}`)
				);
				return [];
			}
		}
	} else {
		if (isLeaf(node)) {
			module.emit('error', new Error(`Address ${first} does not exist`));
			return [];
		}
		const leafOrNode = Array.isArray(node)
			? node[parseInt(first)]
			: node[first];
		if (!leafOrNode) {
			module.emit('error', new Error(`Address ${first} does not exist`));
			return [];
		} else
			return getAddressValuePairs(address, value, module, leafOrNode, oAddress);
	}
}
