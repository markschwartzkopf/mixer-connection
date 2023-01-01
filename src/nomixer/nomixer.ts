import EventEmitter from 'events';
import {
	getValFromNode,
	isError,
	isLeaf,
} from '../mixer-object-utils/mixer-object-utils';
import {
	MixerModule,
	MixerStatus,
	NodeValue,
	ModuleEvents,
	MixerObject,
	MixerStrip,
	MixerDca,
	MixerBoolean,
	MixerLayer,
	MixerLeaf,
	MixerLeafError,
	NodeObject,
	MixerNode,
} from '../types';

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
	private _status: MixerStatus = 'CONNECTED';
	private _mixerObject = newNoMixerObject();

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
		this._status = 'CLOSED';
		this.emit('closed');
	}

	setValuePromise(address: string[], value: NodeValue): Promise<void> {
		return new Promise((res, rej) => {
			rej('code this');
		});
	}

	setValue(address: string[], value: NodeValue) {
		console.error('code this');
	}

	getValue(
		address: string[],
		withMeta: 'withMeta'
	): MixerLeaf | MixerNode | MixerLeafError;
	getValue(address: string[]): NodeValue | NodeObject | null;
	getValue(address: string[], withMeta?: 'withMeta') {
		return withMeta
			? getValFromNode(address, this._mixerObject, withMeta)
			: getValFromNode(address, this._mixerObject);
	}

	get status() {
		return this._status;
	}
}

export function newNoMixerObject(): MixerObject {
	const rtn: MixerObject = {
		strips: {
			ch: (() => {
				const ch: MixerStrip[] = [];
				for (let i = 0; i < channels; i++) {
					const channel: MixerStrip = vanillaStrip(
						`ch.${i + 1}`,
						'channel',
						i + 1,
						i + 1
					);
					channel.main = [
						{
							type: { _type: 'stripType', value: 'main' },
							index: { _type: 'index', value: 1, max: 1 },
						},
					];
					(channel.pan = { _type: 'linear', value: 0, min: -100, max: 100 }),
						ch.push(channel);
				}
				return ch;
			})(),
			main: [vanillaStrip('LR', 'main', 0, 0)],
		},
		groups: {
			dca: (() => {
				const dca: MixerDca[] = [];
				for (let i = 0; i < dcaCount; i++) {
					dca.push({
						name: { _type: 'string', value: `DCA.${i + 1}` },
						color: {
							_type: 'enum',
							value: colorEnum[i + channels],
							enum: colorEnum,
						},
						mute: { _type: 'boolean', value: false },
						level: { _type: 'level', value: '-oo', max: 10 },
					});
				}
				return dca;
			})(),
			muteGroup: [],
			layer: (() => {
				const layer: MixerLayer[] = [];
				for (let i = 0; i < dcaCount; i++) {
					layer.push({
						name: { _type: 'string', value: `User.${i + 1}` },
						assigned: (() => {
							const assignedValue: MixerObject['groups']['layer'][number]['assigned'] =
								[];
							for (let j = 0; j < 2; j++) {
								assignedValue.push({ on: { _type: 'boolean', value: false } });
							}
							return assignedValue;
						})(),
					});
				}
				return layer;
			})(),
		},
		config: {
			reset: { _type: 'boolean', value: false },
		},
	};
	return rtn;
}

function vanillaStrip(
	name: string,
	icon: keyof typeof iconEnum,
	color: number,
	source: number
): MixerStrip {
	color = color % colorEnum.length;
	const rtn: MixerStrip = {
		name: { _type: 'string', value: name },
		icon: { _type: 'enum', value: icon, enum: Object.keys(iconEnum) },
		color: { _type: 'enum', value: colorEnum[color], enum: colorEnum },
		mute: { _type: 'boolean', value: true },
		level: { _type: 'level', value: '-oo', max: 10 },
		order: [
			{ _type: 'enum', value: 'input', enum: ['input', 'fader'] },
			{ _type: 'enum', value: 'fader', enum: ['input', 'fader'] },
		],
		dca: (() => {
			const dca: MixerBoolean[] = [];
			for (let i = 0; i < dcaCount; i++) {
				dca.push({ _type: 'boolean', value: false });
			}
			return dca;
		})(),
		mutegroup: [],
	};
	if (source)
		rtn.source = {
			type: { _type: 'enum', value: 'preamps', enum: ['preamps'] },
			index: { _type: 'index', value: source, max: channels },
		};
	return rtn;
}
