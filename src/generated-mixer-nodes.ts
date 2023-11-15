//This file was automatically generated
//DO NOT MODIFY IT BY HAND
//Instead, modify the appropriate file in the src/build directory, and run the build script.

import { MixerLeaf } from '../src/mixer-leaf';

class SomeMixerChannelStrips_ITEM_Node implements MixerNode {
	readonly type = 'node';
	readonly children: {
		mute: MixerLeaf<MixerDefLeafBoolean>;
		fader: MixerLeaf<MixerDefLeafNumber>
	} = {
		mute: new MixerLeaf<MixerDefLeafBoolean>({_type: 'boolean', default: false}, this, [...this.address, 'mute']),
		fader: new MixerLeaf<MixerDefLeafNumber>({_type: 'number', min: -Infinity, max: 10, default: -Infinity}, this, [...this.address, 'fader'])
	};
	constructor(readonly parent: MixerNode, readonly address: string[]) {}
}

class SomeMixerChannelStripsNode implements MixerNode {
	readonly type = 'node';
	readonly children: {
		'01': SomeMixerChannelStrips_ITEM_Node;
		'02': SomeMixerChannelStrips_ITEM_Node;
		'03': SomeMixerChannelStrips_ITEM_Node;
		'04': SomeMixerChannelStrips_ITEM_Node;
		'05': SomeMixerChannelStrips_ITEM_Node;
		'06': SomeMixerChannelStrips_ITEM_Node;
		'07': SomeMixerChannelStrips_ITEM_Node;
		'08': SomeMixerChannelStrips_ITEM_Node
	} = {
		'01': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '01']),
		'02': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '02']),
		'03': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '03']),
		'04': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '04']),
		'05': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '05']),
		'06': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '06']),
		'07': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '07']),
		'08': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '08'])
	};
	constructor(readonly parent: MixerNode, readonly address: string[]) {}
}

class SomeMixerConfigNode implements MixerNode {
	readonly type = 'node';
	readonly children: {
		name: MixerLeaf<MixerDefLeafString>
	} = {
		name: new MixerLeaf<MixerDefLeafString>({_type: 'string', default: 'Some Mixer'}, this, [...this.address, 'name'])
	};
	constructor(readonly parent: MixerNode, readonly address: string[]) {}
}

class SomeMixerRootNode implements MixerNode {
	static readonly mixerModel = 'noMixer';
	readonly type = 'node';
	readonly parent = null;
	readonly address = [];
	readonly children: {
		channelStrips: SomeMixerChannelStripsNode;
		config: SomeMixerConfigNode
	} = {
		channelStrips: new SomeMixerChannelStripsNode(this, [...this.address, 'channelStrips']),
		config: new SomeMixerConfigNode(this, [...this.address, 'config'])
	};
}

export type MixerModel = 'someMixer';

export const mixerRoots = {someMixer: new SomeMixerRootNode()};

export type MixerRoots = typeof mixerRoots;