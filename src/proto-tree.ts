import {
  MetaNode,
  NodeChildren,
} from './mixer-object-utils/mixer-object-types';
import { MixerModel } from './types';

//export type MixerTree = NodeChildren<MixerRootNode>

export class MixerRootNode extends MetaNode {
  readonly model: MixerModel;
  readonly address = [];
  children = {
    config: new MixerConfigNode(),
  };
  constructor(model: MixerModel) {
    super();
    this.model = model;
  }

  get getTree(): MixerTree {
    return this.getObject;
  }
}

export class MixerConfigNode extends MetaNode {
  readonly address = ['config'];
}

const MixerStrip: TreeNode = {
  name: 'string',
  color: 'enum', //hex color string, enum
  mute: 'boolean',
  level: 'exponential', //db
};

const MixerTree: TreeNode = {
  strips: {
    ch: [MixerStrip]
  }
};

type TreeLeaf = 'string' | 'enum' | 'boolean' | 'exponential';
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

interface 



//old
/* type MixerObject = {
  strips: {
    ch: MixerStrip[];
    aux?: MixerStrip[];
    fxrtn?: MixerStrip[];
    bus?: MixerStrip[];
    matrix?: MixerStrip[];
    main: MixerStrip[];
  };
  groups: {
    dca: MixerDca[];
    muteGroup: MixerMuteGroup[];
    layer: MixerLayer[];
  };
  fx?: { model: MixerKey<string, string> } & {
    [k: string]: MixerNode | MixerLeaf;
  };
  config: MixerNode;
  icons?: MixerIcons;
}; */

/* type MixerStrip = {
  name?: MixerString;
  color?: MixerEnum<string>; //hex color string, enum
  icon?: MixerEnum<string>;
  source?: {
    type: MixerEnum<string>;
    index: MixerIndex;
  };
  delay?: {
    time: MixerLinear; //ms
    on?: MixerBoolean;
  };
  preamp?: {
    gain?: MixerLinear; //db
    trim?: MixerLinear; //db
    invert?: MixerBoolean;
  };
  mute: MixerBoolean;
  level: MixerLevel; //db
  pan?: MixerLinear; //%
  width?: MixerLinear; //%
  custom?: MixerNode;
  eq?: {
    filters?: {
      //dedicated filters
      hp?: {
        freq: MixerExponential; //Hz
        slope: MixerLinear;
        on: MixerBoolean;
      };
      lp?: {
        freq: MixerExponential; //Hz
        slope: MixerLinear;
        on: MixerBoolean;
      };
    };
    bands?: {
      type: MixerEnum<string>;
      gain?: MixerLinear; //db
      freq: MixerExponential; //Hz
      q: MixerLinear; //q or slope
      on: MixerBoolean;
    };
  }; */
