import * as fsPromises from 'fs/promises';
import mixers from '../mixer-definitions/all-mixers';
import { MixerDefNode, MixerDefArray, MixerDefLeaf } from '../mixer-node-leaf';

type ValType = 'string' | 'number' | 'boolean';
type ValTreeObjectType = { [k: string]: ValTreeType };
type ValTreeArrayType = [null, ...ValTreeType[]];

type ValTreeType = ValTreeObjectType | ValTreeArrayType | ValType;

const warning = `// Generated code message:

//This file was automatically generated
//DO NOT MODIFY IT BY HAND
//Instead, modify the appropriate mixer definition or the build script, and run the build script`;

const blocks: string[] = [warning];
const valTreeTypes: ValTreeType = {};
const mixerNames: string[] = [];
for (const mixerName of Object.keys(mixers)) {
	valTreeTypes[mixerName] = createType(
		mixers[mixerName as keyof typeof mixers]
	);
	mixerNames.push(mixerName);
}
blocks.push(`export type MixerModel = '${mixerNames.join(`' | '`)}';`);
blocks.push(`export type MixerTrees = ${tsStringifyType(valTreeTypes)}`);
fsPromises
	.writeFile('./src/generated-mixer-types.ts', blocks.join('\r\n\r\n'))
	.catch((err) => {
		console.error(err);
	});

//end

function createType(
	def: MixerDefNode | MixerDefArray | MixerDefLeaf
): ValTreeType {
	if (!def._type) return createNodeType(def);
	if (def._type === 'array')
		return [
			null,
			...new Array(def.end - (def.start ? def.start : 1) + 1).fill(
				createType(def.items)
			),
		];
	return createLeafType(def as MixerDefLeaf); //
}

function createLeafType(def: MixerDefLeaf): ValTreeType {
	//Should create TypeScript error if switch cases are not exhaustive
	const type = def._type;
	switch (def._type) {
		case 'boolean':
			return 'boolean';
			break;
		case 'enum':
			return 'string';
			break;
		case 'number':
			return 'number';
			break;
		case 'string':
			return 'string';
			break;
	}
	console.error(`Unknown mixer definition leaf type '${type}'`);
}

function createNodeType(def: MixerDefNode): ValTreeObjectType {
	const rtn: ValTreeObjectType = {};
	for (const [prop, childDef] of Object.entries(def)) {
		rtn[prop] = createType(childDef);
	}
	return rtn;
}

function tsStringifyType(valTree: ValTreeType, level?: number) {
	//.replace(/'([^']+)':/g, '$1:'); useful, but not for this
	if (!level) level = 0;
	let rtn = '';
	if (Array.isArray(valTree)) {
		rtn += '[\r\n';
		const arrLevel = level;
		valTree.forEach((val) => {
			if (typeof val === 'string') {
				rtn += `${tabs(arrLevel + 1)}${val},\r\n`;
			} else if (val === null) {
				rtn += `${tabs(arrLevel + 1)}never,\r\n`;
			} else {
				rtn += `${tabs(arrLevel + 1)}${tsStringifyType(
					val,
					arrLevel + 1
				)},\r\n`;
			}
		});
	} else {
		rtn += '{\r\n';
		for (const [rawProp, val] of Object.entries(valTree)) {
			const prop = !isNaN(rawProp as any) ? `'${rawProp}'` : rawProp;
			if (typeof val === 'string') {
				rtn += `${tabs(level + 1)}${prop}: ${val};\r\n`;
			} else {
				rtn += `${tabs(level + 1)}${prop}: ${tsStringifyType(
					val,
					level + 1
				)};\r\n`;
			}
		}
	}
	rtn += Array.isArray(valTree) ? `${tabs(level)}]` : `${tabs(level)}}`;
	return rtn;
}

function tabs(num: number) {
	let rtn = '';
	for (let i = 0; i < num; i++) rtn += '\t';
	return rtn;
}
