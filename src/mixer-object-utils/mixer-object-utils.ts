import {
	MixerLeaf,
	MixerLeafError,
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
  if (!nodeOrLeaf) return { _type: 'error', error: `address ${first} does not exist` };
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

function isLeafArray(test: MixerNode[] | MixerLeaf[]): test is MixerLeaf[] {
	return test.length === 0 || isLeaf(test[0]);
}
