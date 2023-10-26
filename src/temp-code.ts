import { MixerLeaf } from './mixer-object-utils/mixer-object-types';

const MixerStrip: TreeNode = {
  name: 'string',
  color: 'enum', //hex color string, enum
  mute: 'boolean',
  level: 'exponential', //db
};

const MixerTree: TreeNode = {
  strips: {
    ch: [MixerStrip],
  },
};

type TreeLeaf = 'string' | 'enum' | 'boolean' | 'exponential'; //fix this later to add min, max, enum lists, etc.
type TreeNode = { [K: string]: TreeNode | TreeNode[] | TreeLeaf }; //Partial to allow optional properties in decendants
type BasicType<T extends TreeLeaf> = T extends 'string'
  ? string
  : T extends 'enum'
  ? string
  : T extends 'boolean'
  ? boolean
  : T extends 'exponential'
  ? number
  : never;

export interface MixerNode<T extends TreeNode> {
  readonly address: string[];
  readonly children: {
    [k: string | number]:
      | MixerNode<TreeNode>
      | MixerNode<TreeNode>[]
      | MixerLeaf<any>;
  };
  //getObject: nodeChildren<MetaNode>;
}

export class MixerNode<T extends TreeNode> {
  readonly address: string[] = [];
  readonly children: {
    [k: string | number]:
      | MixerNode<TreeNode>
      | MixerNode<TreeNode>[]
      | MixerLeaf<any>;
  } = {};

  /* get getObject(): NodeChildren<typeof this> {
			return getObject<typeof this>(this.children);
		} */

  //getMetaObject: ?
}

/* type TreeNodeToChildren<T extends TreeNode> = {
  [prop in keyof T]: T[prop] extends TreeLeaf ? boolean : T[prop];
}; */

type TreePartToChild<T extends TreeNode | TreeNode[] | TreeLeaf> =
  T extends TreeNode
    ? MixerNode<T>
    : T extends TreeNode[]
    ? TreeNodesToMixerNodes<T>
    : T extends TreeLeaf
    ? boolean
    : never;

type TreeNodesToMixerNodes<T extends TreeNode[]> = {
  [P in keyof T]: TreePartToChild<T[P]>;
};

type testTupIn = [boolean, string];
type testTupTrans = {};

type Box<T> = { value: T };
type Boxified<T> = { [P in keyof T]: Box<T[P]> };
type testBox = Boxified<testTupIn>;
const y: testBox = [{ value: true }, { value: 'sd' }];



