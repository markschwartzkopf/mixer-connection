import { MixerLeafBoolean, NodeChildren } from '../mixer-object-utils/mixer-object-types';
import { MixerConfigNode, MixerRootNode } from '../proto-tree';

export type NoMixerTree = NodeChildren<NoMixerRootNode>

export class NoMixerRootNode extends MixerRootNode {
	readonly model = 'noMixer';
  readonly address = [];
  children = {
    config: new NoMixerConfigNode(),
  };
	constructor() {
		super('noMixer');
	}
	get getTree(): NoMixerTree {
    return this.getObject;
  }
}

class NoMixerConfigNode extends MixerConfigNode {
  address = ['config'];
  readonly children = { reset: new MixerLeafBoolean(['config', 'reset'], false) };
}