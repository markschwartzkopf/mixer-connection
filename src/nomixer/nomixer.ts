import EventEmitter from 'events';
import {
	MixerBoolean,
	MixerEnum,
	MixerIndex,
	MixerKey,
	MixerLevel,
	MixerLinear,
	MixerString,
	MixerStripType,
} from '../mixer-object-utils/leaf-types';
import { getAddressValuePairs } from '../mixer-object-utils/mixer-object-utils';
import {
	MixerModule,
	MixerStatus,
	NodeValue,
	ModuleEvents,
	MixerObject,
	MixerStrip,
	MixerDca,
	MixerLayer,
	NodeObject,
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
	status: MixerStatus = 'CONNECTED';
	mixerObject = newNoMixerObject();

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

	setValuePromise(
		address: string[],
		value: NodeValue | NodeObject
	): Promise<void> {
		return new Promise((res) => {
			this.setValue(address, value);
			res();
		});
	}

	setValue(address: string[], value: NodeValue | NodeObject): void {
		const pairs = getAddressValuePairs(address, value, this);
		console.log(JSON.stringify(pairs, null, 2));
	}
}

function newNoMixerObject(): MixerObject {
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
							type: new MixerStripType('main'),
							index: new MixerIndex(1),
						},
					];
					channel.pan = new MixerLinear(-100, 100, { default: 0 });
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
						name: new MixerString(`DCA.${i + 1}`),
						color: new MixerEnum(colorEnum, colorEnum[i + channels]),
						mute: new MixerBoolean(),
						level: new MixerLevel(10),
					});
				}
				return dca;
			})(),
			muteGroup: [],
			layer: (() => {
				const layer: MixerLayer[] = [];
				for (let i = 0; i < dcaCount; i++) {
					layer.push({
						name: new MixerString(`User.${i + 1}`),
						assigned: (() => {
							const assignedValue: MixerObject['groups']['layer'][number]['assigned'] =
								[];
							for (let j = 0; j < 2; j++) {
								assignedValue.push({
									_key: new MixerKey('on'),
									on: new MixerBoolean() as { _type: 'boolean'; value: false }, //Not sure the cleanest way to handle this keyed type
								});
							}
							return assignedValue;
						})(),
					});
				}
				return layer;
			})(),
		},
		config: {
			reset: new MixerBoolean(),
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
		name: new MixerString(name),
		icon: new MixerEnum(Object.keys(iconEnum), icon),
		color: new MixerEnum(colorEnum, colorEnum[color]),
		mute: new MixerBoolean(true),
		level: new MixerLevel(10),
		order: [
			new MixerEnum(['input', 'fader'], 'input'),
			new MixerEnum(['input', 'fader'], 'fader'),
		],
		dca: (() => {
			const dca: MixerBoolean[] = [];
			for (let i = 0; i < dcaCount; i++) {
				dca.push(new MixerBoolean());
			}
			return dca;
		})(),
		mutegroup: [],
	};
	if (source)
		rtn.source = {
			type: new MixerEnum(['preamps']),
			index: new MixerIndex(channels, source),
		};
	return rtn;
}
