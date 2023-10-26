import EventEmitter from 'events';

interface NodeEvents {
  placeholder: (eventPayload: any) => void;
}

export interface mixerNode {
  on<U extends keyof NodeEvents>(event: U, listener: NodeEvents[U]): this;
  once<U extends keyof NodeEvents>(event: U, listener: NodeEvents[U]): this;
  emit<U extends keyof NodeEvents>(
    event: U,
    ...args: Parameters<NodeEvents[U]>
  ): boolean;
}

export class mixerNode extends EventEmitter {
  constructor(def: NodeDef) {
    super();
  }
}

///temp code

interface NodeDef {
  type: 'node';
  children: { [k: string]: NodeDef | LeafDef };
}

type LeafDef = LeafDefBoolean | LeafDefEnum | LeafDefNumber;

type LeafDefBoolean = {
  type: 'boolean';
  default: boolean;
};

type LeafDefEnum = {
  type: 'enum';
  values: string[];
  default: number; //index of values array
};

type LeafDefNumber = {
  type: 'number';
  tag?: 'exponential' | 'logarithmic';
  default: number;
};

const someMixer = {
  type: 'node',
  children: {
    channelStrips: {
      type: 'node',
      children: {
        1: { type: 'number', default: 0 },
        2: { type: 'number', default: 0 },
        3: { type: 'number', default: 0 },
        4: { type: 'number', default: 0 },
      },
    },
    config: {
      type: 'node',
      children: {
        reset: { type: 'boolean', default: false },
      },
    },
  },
};

type NodeVal<T extends NodeDef> = {
  [P in keyof T['children']]: NodeTree<T['children'][P]>;
};
type LeafVal<T extends LeafDef> = T['default'];
type NodeTree<T extends NodeDef | LeafDef> = T extends NodeDef
  ? NodeVal<T>
  : T extends LeafDef
  ? LeafVal<T>
  : never;
const z: LeafVal<LeafDefBoolean> = false;

console.log(z);

function getDefaultMixerTree<T extends NodeDef>(def: T): NodeVal<T> {
  return {
    channelStrips: { 1: 0, 2: 0, 3: 0, 4: 0 },
    config: { reset: false },
  };
}
let a = getDefaultMixerTree<typeof someMixer>(someMixer);
const b: typeof someMixer = { type: 'node', children: {} };

///psuedocode
interface proto {
  a: string;
  children?: { [k: string]: proto };
}

interface specific extends proto {
  a: 'specific text';
  children: {
    yo: { a: 'other text' };
    ye: { a: 'more text' };
    [k: string]: proto;
  };
}

const x: specific = {
  a: 'specific text',
  children: {
    yo: { a: 'other text' },
    ye: { a: 'more text' },
    yepp: { a: 'blah', children: {} },
  },
};
