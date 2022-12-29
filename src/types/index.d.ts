export interface MixerModule {
	setNode: (address: string[], value: NodeValue) => Promise<void>;
  getNode: (address: string[], value: NodeValue) => Promise<NodeValue>;
	status: MixerStatus;

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

export type NodeValue = string | boolean | number | NodeObject;
export type NodeObject = { [k: string]: NodeValue };

export type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';
