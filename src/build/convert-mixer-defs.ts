import * as fsPromises from 'fs/promises';
import mixers from './mixer-definitions/all-mixers';
import { MixerDefNode, MixerDefArray, MixerDefLeaf } from '../mixer-node-leaf';
const classes: { name: string; val: ValTreeType }[] = [];
const nodes: string[] = [];
const rootNodes: [string, string][] = [];
const mixerNames: string[] = [];
let warning = '';

type ValType = 'string' | 'number' | 'boolean';
type ValTreeType = ValTreeObject | ValTreeArray;

type ValTreeObject = { [k: string]: ValTreeType | ValType };
type ValTreeArray = [null, ...(ValTreeType | ValType)[]];

fsPromises
	.readFile('./src/build/base/node.ts')
	.then((val) => {
		const [root, child, , warningIn] = val.toString().split('\r\n\r\n');
		warning = warningIn;
		const baseNodes = { root: root, child: child };
		nodes.push(
			warning,
			`import { MixerLeaf, MixerNode, MixerDefLeafBoolean, MixerDefLeafEnum, MixerDefLeafNumber, MixerDefLeafString } from './mixer-node-leaf';`
		);
		const valTreeTypes: ValTreeType = {};
		for (const [mixerName, def] of Object.entries(mixers)) {
			valTreeTypes[mixerName] = {};
			mixerNames.push(mixerName);
			rootNodes.push([
				mixerName,
				createNodes(
					def,
					mixerName,
					[],
					baseNodes,
					valTreeTypes[mixerName] as ValTreeType
				),
			]);
		}
		nodes.push(`export type MixerModel = '${mixerNames.join(`' | '`)}';`);
		nodes.push(
			`export const mixerRoots = { ${rootNodes
				.map((x) => `${x[0]}: new ${x[1]}()`)
				.join(', ')} };`
		);
		nodes.push(`export type MixerRoots = typeof mixerRoots;`);
		nodes.push(`export type MixerTrees = ${tsStringifyType(valTreeTypes)}`);
		return fsPromises
			.writeFile('./src/generated-mixer-nodes.ts', nodes.join('\r\n\r\n'))
			.catch((err) => {
				console.error(err);
			});
	})
	.catch((err) => {
		console.error(err);
	});

function createNodes(
	def: MixerDefNode | MixerDefArray,
	mixerName: string,
	address: string[],
	baseNodes: { root: string; child: string },
	valTreeType: ValTreeType,
	isArrayItem?: 'isArrayItem'
): string {
	//class name
	const addressString =
		address.length === 0 ? 'Root' : address.map(capitalize).join('');
	const className = `${capitalize(mixerName)}${addressString}Node`;
	const index = classes.map((x) => x.name).indexOf(className);
	if (index > -1) {
		if (Array.isArray(valTreeType)) {
			valTreeType.splice(
				0,
				valTreeType.length,
				...(classes[index].val as ValTreeArray)
			);
		} else Object.assign(valTreeType, classes[index].val);
		return className;
	}
	classes.push({ name: className, val: valTreeType });
	let code = address.length === 0 ? baseNodes.root : baseNodes.child;
	code = code.replace(
		address.length === 0 ? 'ROOT_NODE_NAME' : 'CHILD_NODE_NAME',
		className
	);
	if (address.length === 0)
		code = code.replace(`static readonly mixerName = '';`, '');

	if (!isArrayItem) code = code.replace(`, readonly mixerNumber: string`, '');

	//populate children
	const children: [string, string][] = [];
	if (def._type === 'array') {
		const arrayDef = def as MixerDefArray;
		let prop = 0;
		for (let i = arrayDef.start; i <= arrayDef.end; i++) {
			prop++;
			const chars = arrayDef.indexDigits ? arrayDef.indexDigits : 0;
			const mixerNumber = i.toString().padStart(chars, '0');
			const childDef = arrayDef.items;
			if (childDef._type && childDef._type !== 'array') {
				let valType: ValType = 'string';
				if (childDef._type === 'boolean') valType = 'boolean';
				if (childDef._type === 'number') valType = 'number';
				(valTreeType as ValTreeArray)[prop] = valType;
				children.push(
					leafDefInstString(
						childDef as MixerDefLeaf,
						prop.toString(),
						mixerNumber
					)
				);
			} else {
				(valTreeType as ValTreeArray)[prop] =
					childDef._type === 'array' ? [null] : {};
				const childName = createNodes(
					childDef,
					mixerName,
					[...address, '_ITEM_'],
					baseNodes,
					(valTreeType as ValTreeArray)[prop] as ValTreeType,
					'isArrayItem'
				);
				children.push([
					`'${prop}': ${childName}`,
					`'${prop}': new ${childName}(this, [...this.address, '${prop.toString()}'], '${mixerNumber}')`,
				]);
			}
		}
	} else {
		for (const [rawProp, childDef] of Object.entries(def as MixerDefNode)) {
			const prop = !isNaN(rawProp as any) ? `'${rawProp}'` : rawProp;
			if (childDef._type && childDef._type !== 'array') {
				let valType: ValType = 'string';
				if (childDef._type === 'boolean') valType = 'boolean';
				if (childDef._type === 'number') valType = 'number';
				(valTreeType as ValTreeObject)[prop] = valType;
				children.push(leafDefInstString(childDef as MixerDefLeaf, prop));
			} else {
				(valTreeType as ValTreeObject)[prop] =
					childDef._type === 'array' ? [null] : {};
				const childName = createNodes(
					childDef,
					mixerName,
					[...address, prop],
					baseNodes,
					(valTreeType as ValTreeObject)[prop] as ValTreeType
				);
				children.push([
					`${prop}: ${childName}`,
					`${prop}: new ${childName}(this, [...this.address, '${prop}'])`,
				]);
			}
		}
	}
	code = code.replace(
		`[k: string]: MixerNode['children'][string];`,
		children.map((x) => x[0]).join(';\r\n\t\t')
	);
	code = code.replace(
		'/* CHILDREN */',
		children.map((x) => x[1]).join(',\r\n\t\t')
	);

	nodes.push(code);
	return className;
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
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

function defToString(def: MixerDefLeaf): string {
	const regex = new RegExp('"', 'g');
	const defProps: string[] = [];
	for (const [prop, val] of Object.entries(def)) {
		defProps.push(
			`${prop}: ${
				typeof val === 'number'
					? val.toString()
					: JSON.stringify(val).replace(regex, `'`) // If a mixer definition has a string that contains a ", God help us all
			}`
		);
	}
	return `{${defProps.join(', ')}}`;
}

function leafDefInstString(
	def: MixerDefLeaf,
	prop: string,
	mixerNumber?: string
): [string, string] {
	let type = '';
	switch (def._type) {
		case 'string':
			type = 'MixerDefLeafString';
			break;
		case 'number':
			type = 'MixerDefLeafNumber';
			break;
		case 'boolean':
			type = 'MixerDefLeafBoolean';
			break;
	}
	return [
		`${prop}: MixerLeaf<${type}>`,
		`${prop}: new MixerLeaf<${type}>(${defToString(
			def
		)}, this, [...this.address, '${prop}']${
			mixerNumber ? `, '${mixerNumber}'` : ''
		})`,
	];
}
