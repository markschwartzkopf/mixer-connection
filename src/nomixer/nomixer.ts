import EventEmitter from 'events';
import { MixerModule, MixerStatus, ModuleEvents } from '../types';
import { NoMixerRootNode } from './nomixer-tree';


const iconEnum = {
  channel: { value: '', type: 'string' },
  dca: { value: '', type: 'string' },
  main: { value: '', type: 'string' },
  other: { value: '', type: 'string' },
};

const colorEnum = [
  '#000000',
  '#a2e0eb',
  '#40f2fc',
  '#40b5eb',
  '#24fced',
  '#00f231',
  '#c5df3d',
  '#fef200',
  '#fc8d33',
  '#fc3232',
  '#fe9168',
  '#fba1f9',
  '#a18dfe',
];

const channels = 8;
const dcaCount = 3;

//Not sure why this doesn't get imported with MixerModule:
export interface NoMixer {
  on<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
  once<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
  emit<U extends keyof ModuleEvents>(
    event: U,
    ...args: Parameters<ModuleEvents[U]>
  ): boolean;
}

export class NoMixer extends EventEmitter implements MixerModule {
  status: MixerStatus = 'CONNECTED';
  mixerTree = new NoMixerRootNode();

  constructor(address?: string) {
    super();
    setTimeout(() => {
      this.emit(
        'info',
        `Connected to noMixer at theoretical address ${address}`
      );
      this.emit('connected');
    }, 500);
  }

  close() {
    this.emit('info', 'Closing non-existent connection to noMixer');
    this.status = 'CLOSED';
    this.emit('closed');
  }
}
