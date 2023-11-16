import { MixerDefLeaf, MixerLeaf, MixerNode } from './mixer-node-leaf';

/* type NodeValue<T extends MixerNode> = {
	[prop in keyof T['children']]: NodeOrLeafValue<T['children'][prop]>
}

type NodeOrLeafValue<T extends MixerNode | MixerLeaf<MixerDefLeaf>> = T extends MixerNode
    ? NodeValue<T>
    : T extends MixerLeaf<MixerDefLeaf>
    ? T['value']
    : never */

export function getNodeValue(node: MixerNode): valueNode {
	const rtn: valueNode = {};
	for (const prop in node.children) rtn[prop] = node.children[prop].type === 'node' ? getNodeValue(node.children[prop] as MixerNode) : (node.children[prop] as MixerLeaf<MixerDefLeaf>).value;
	return rtn;
}

type valueNode = {[k: string]: valueNode | MixerLeaf<MixerDefLeaf>['value']}