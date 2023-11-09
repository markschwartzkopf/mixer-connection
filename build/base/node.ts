class ROOT_NODE_NAME implements MixerNode {
	readonly type = 'node';
	readonly parent = null;
	readonly address = [];
	readonly children: MixerNode['children'] = {
		/* CHILDREN */
	};
}

class CHILD_NODE_NAME implements MixerNode {
	readonly type = 'node';
	readonly address = [];
	readonly children: MixerNode['children'] = {
		/* CHILDREN */
	};
	constructor(readonly parent: MixerNode) {}
}
