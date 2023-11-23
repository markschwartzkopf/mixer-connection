//This file was automatically generated
//DO NOT MODIFY IT BY HAND
//Instead, modify the appropriate file in the src/build directory, and run the build script.

import { MixerLeaf, MixerNode, MixerDefLeafBoolean, MixerDefLeafEnum, MixerDefLeafNumber, MixerDefLeafString } from './mixer-node-leaf';

class SomeMixerChannelStrips_ITEM_Node implements MixerNode {
	readonly type = 'node';
	readonly children: {
		mute: MixerLeaf<MixerDefLeafBoolean>;
		fader: MixerLeaf<MixerDefLeafNumber>
	} = {
		mute: new MixerLeaf<MixerDefLeafBoolean>({mixerAddress: ['ch',2,'mute'], _type: 'boolean', default: false}, this, [...this.address, 'mute']),
		fader: new MixerLeaf<MixerDefLeafNumber>({mixerAddress: ['ch',2,'fader'], _type: 'number', min: -Infinity, max: 10, default: -Infinity}, this, [...this.address, 'fader'])
	};
	constructor(readonly parent: MixerNode, readonly address: string[], readonly mixerNumber: string) {}
}

class SomeMixerChannelStripsNode implements MixerNode {
	readonly type = 'node';
	readonly children: {
		'1': SomeMixerChannelStrips_ITEM_Node;
		'2': SomeMixerChannelStrips_ITEM_Node;
		'3': SomeMixerChannelStrips_ITEM_Node;
		'4': SomeMixerChannelStrips_ITEM_Node;
		'5': SomeMixerChannelStrips_ITEM_Node;
		'6': SomeMixerChannelStrips_ITEM_Node;
		'7': SomeMixerChannelStrips_ITEM_Node;
		'8': SomeMixerChannelStrips_ITEM_Node
	} = {
		'1': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '1'], '01'),
		'2': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '2'], '02'),
		'3': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '3'], '03'),
		'4': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '4'], '04'),
		'5': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '5'], '05'),
		'6': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '6'], '06'),
		'7': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '7'], '07'),
		'8': new SomeMixerChannelStrips_ITEM_Node(this, [...this.address, '8'], '08')
	};
	constructor(readonly parent: MixerNode, readonly address: string[]) {}
}

class SomeMixerTestLeavesNode implements MixerNode {
	readonly type = 'node';
	readonly children: {
		1: MixerLeaf<MixerDefLeafBoolean>;
		2: MixerLeaf<MixerDefLeafBoolean>;
		3: MixerLeaf<MixerDefLeafBoolean>
	} = {
		1: new MixerLeaf<MixerDefLeafBoolean>({mixerAddress: ['test',2], _type: 'boolean', default: false}, this, [...this.address, '1'], '001'),
		2: new MixerLeaf<MixerDefLeafBoolean>({mixerAddress: ['test',2], _type: 'boolean', default: false}, this, [...this.address, '2'], '002'),
		3: new MixerLeaf<MixerDefLeafBoolean>({mixerAddress: ['test',2], _type: 'boolean', default: false}, this, [...this.address, '3'], '003')
	};
	constructor(readonly parent: MixerNode, readonly address: string[]) {}
}

class SomeMixerConfigNode implements MixerNode {
	readonly type = 'node';
	readonly children: {
		name: MixerLeaf<MixerDefLeafString>
	} = {
		name: new MixerLeaf<MixerDefLeafString>({mixerAddress: ['-config','name'], _type: 'string', default: 'Some Mixer'}, this, [...this.address, 'name'])
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
		testLeaves: SomeMixerTestLeavesNode;
		config: SomeMixerConfigNode
	} = {
		channelStrips: new SomeMixerChannelStripsNode(this, [...this.address, 'channelStrips']),
		testLeaves: new SomeMixerTestLeavesNode(this, [...this.address, 'testLeaves']),
		config: new SomeMixerConfigNode(this, [...this.address, 'config'])
	};	
}

export type MixerModel = 'someMixer';

export const mixerRoots = { someMixer: new SomeMixerRootNode() };

export type MixerRoots = typeof mixerRoots;

export type MixerTrees = {
	someMixer: {
		channelStrips: [
			never,
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
			{
				mute: boolean;
				fader: number;
			},
		];
		testLeaves: [
			never,
			boolean,
			boolean,
			boolean,
		];
		config: {
			name: string;
		};
	};
}