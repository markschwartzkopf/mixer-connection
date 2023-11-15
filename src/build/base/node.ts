class ROOT_NODE_NAME implements MixerNode {
	static readonly mixerModel = 'noMixer';
	readonly type = 'node';
	readonly parent = null;
	readonly address = [];
	readonly children: {
		[k: string]: MixerNode['children'][string];
	} = {
		/* CHILDREN */
	};
}

class CHILD_NODE_NAME implements MixerNode {
	readonly type = 'node';
	readonly children: {
		[k: string]: MixerNode['children'][string];
	} = {
		/* CHILDREN */
	};
	constructor(readonly parent: MixerNode, readonly address: string[]) {}
}

// Generated code message:

//This file was automatically generated
//DO NOT MODIFY IT BY HAND
//Instead, modify the appropriate file in the src/build directory, and run the build script.