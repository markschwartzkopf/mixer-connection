import { MetaNode, NodeChildren } from "./mixer-object-utils/mixer-object-types";
import { MixerModel } from "./types";

export type MixerTree = NodeChildren<MixerRootNode>

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

/* function newNoMixerObject(): MixerObject {
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
									type: new MixerStripType('off'),
									index: new MixerIndex(channels),
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
		dyn1: {
			type: new MixerKey<'comp' | 'gate', 'comp'>(['comp', 'gate'], 'comp'),
			env: new MixerEnum<'log'>(['log']),
			knee: new MixerLinear(1, 4),
			mgain: new MixerLinear(0, 10),
			thr: new MixerExponential(-60, 0),
			ratio: new MixerExponential(1, 100),
			on: new MixerBoolean(true),
		},
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
 */