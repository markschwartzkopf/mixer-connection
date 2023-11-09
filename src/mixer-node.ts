type BooleanLeafDefinition = { type: 'boolean'; default: boolean };
type NumberLeafDefinition = { type: 'number'; max: number; default: number };
type StringLeafDefinition = { type: 'string'; default: string };
type LeafDefinition =
	| BooleanLeafDefinition
	| NumberLeafDefinition
	| StringLeafDefinition;

type NodeDefinition = {
	type: 'node';
	children: { [k: string]: NodeDefinition | LeafDefinition };
};

type ChildToNodeOrLeaf<T extends NodeDefinition | LeafDefinition> =
	T extends NodeDefinition
		? TreeNode<T>
		: T extends LeafDefinition
		? TreeLeaf<T>
		: never;

type NodeChildren<T extends NodeDefinition> = {
	[prop in keyof T['children']]: ChildToNodeOrLeaf<T['children'][prop]>;
};

type NodeValue<T extends TreeNode<any>> = {
	[prop in keyof T['children']]: T['children'][prop]['value'];
};

class TreeLeaf<T extends LeafDefinition> {
	private _value: T['default'];
	constructor(private definition: T) {
		this._value = definition.default;
	}
	get value() {
		//code to poll the mixer might go here. Would also need for the treaLeaf constructor to have been fed a node address/indentifier to actually work
		return this._value;
	}
	set value(val: T['default']) {
		//code to set a value on the mixer might go here. Would also need for the treaLeaf constructor to have been fed a node address/indentifier to actually work
		this._value = val;
	}
}

class TreeNode<T extends NodeDefinition> {
	children: NodeChildren<T>;
	constructor(private definition: T) {
		this.children = Object.fromEntries(
			Object.entries(definition.children).map(([prop, definition]) => {
				if (definition.type === 'node') {
					return [prop, new TreeNode<typeof definition>(definition)];
				} else {
					return [prop, new TreeLeaf<typeof definition>(definition)];
				}
			})
		);
	}
	get value(): NodeValue<typeof this> {
		const rtn: {
			[k: string]:
				| TreeNode<NodeDefinition>['value']
				| TreeLeaf<LeafDefinition>['value'];
		} = {};
		for (const prop in this.children) rtn[prop] = this.children[prop].value;
		return rtn as NodeValue<typeof this>;
	}
}

//Demo of the preceding code:

//generated constant. The build process needs to take responsibility for ensuring it is of type NodeDefinition
const testMixerDef = {
	type: 'node',
	children: {
		channelStrips: {
			type: 'node',
			children: {
				'01': {
					type: 'number',
					max: 10,
					default: 0 as number, // this will be a generated definition and the build process can add this "as number"
				},
				'02': {
					type: 'number',
					max: 10,
					default: 0 as number, // this will be a generated definition and the build process can add this "as number"
				},
			},
		},
		name: {
			type: 'string',
			default: 'My Mixer' as string, // this will be a generated definition and the build process can add this "as string"
		},
	},
} as const;

const testNode = new TreeNode<typeof testMixerDef>(testMixerDef); //this "<typeof [argument]>([argument])" is hacky and redundant,
testNode.children.name.value = 'My Special Mixer';
testNode.children.name.value = 10; //must fail; Typescript enforces mixer tree structure; testMixer.name is a string

console.log(testNode.value);
console.log(testNode.value.channelStrips['01']);
console.log(testNode.value.nonexistantProperty); //must fail; Typescript enforces mixer tree structure
