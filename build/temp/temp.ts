import { MixerLeaf } from '../src/mixer-leaf';

class SomeMixerConfigNode implements MixerNode {
	readonly type = 'node';
	readonly address = ['config'];
	readonly children: MixerNode['children'] = {
		name: new MixerLeaf<MixerDefLeafString>({_type: 'string', default: 'Some Mixer'}, this, ['config','name'])
	};
	constructor(readonly parent: MixerNode) {}
}
class SomeMixerRootNode implements MixerNode {
	readonly type = 'node';
	readonly parent = null;
	readonly address = [];
	readonly children: MixerNode['children'] = {
		config: new SomeMixerConfigNode(this)
	};
}