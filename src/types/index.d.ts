import { MixerRootNode } from "../proto-tree";

type MixerModel = 'XM32' | 'Xair' | 'Wing' | 'noMixer';

export interface MixerModule {
  close: () => void;
  status: MixerStatus;
  mixerTree: MixerRootNode;

  on<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
  once<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
  emit<U extends keyof ModuleEvents>(
    event: U,
    ...args: Parameters<ModuleEvents[U]>
  ): boolean;
}

interface ModuleEvents {
  error: (err: Error) => void;
  closed: () => void;
  info: (info: string) => void;
  connected: () => void;
}

type NodeValue = string | number | boolean;
type NodeObject =
  | { [k: string]: NodeValue | NodeObject }

type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';