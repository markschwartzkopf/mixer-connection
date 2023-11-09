type MixerModel = 'XM32' | 'Xair' | 'Wing' | 'noMixer';

/* export interface MixerModule {
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
type NodeObject = { [k: string]: NodeValue | NodeObject }; */

type MixerStatus = 'CONNECTED' | 'CONNECTING' | 'CLOSED';

//This needs to work at some point:
interface MixerNode {
	readonly type: 'node';
	readonly address: string[];
	readonly parent: MixerNode | null;
	readonly children: { [k: string]: MixerNode | MixerLeaf };
}

type MixerLeaf = (MixerStringLeaf | MixerNumberLeaf) & {
	get: () => string;
	set: (val: string) => void;
};

interface MixerStringLeaf {
	type: 'string';
	definition: { default: string };
}

interface MixerNumberLeaf {
	type: 'number';
	definition: { default: number };
}
