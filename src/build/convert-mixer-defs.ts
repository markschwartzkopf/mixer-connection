import * as fsPromises from 'fs/promises';
import mixers from './mixer-definitions/all-mixers';
import { MixerDefNode, MixerDefArray, MixerDefLeaf } from '../mixer-node-leaf';
const classes: { name: string; val: ValTreeType }[] = [];
const nodes: string[] = [];
const rootNodes: [string, string][] = [];
const mixerNames: string[] = [];
let warning = '';

type ValType = 'string' | 'number' | 'boolean';
type ValTreeType = { [k: string]: ValTreeType | ValType };

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
	valTreeType: ValTreeType
): string {
	//class name
	const addressString =
		address.length === 0 ? 'Root' : address.map(capitalize).join('');
	const className = `${capitalize(mixerName)}${addressString}Node`;
	const index = classes.map((x) => x.name).indexOf(className);
	if (index > -1) {
		Object.assign(valTreeType, classes[index].val);
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

	//populate children
	const children: [string, string][] = [];
	if (def._type === 'array') {
		const arrayDef = def as MixerDefArray;
		for (let i = arrayDef.start; i <= arrayDef.end; i++) {
			const chars = arrayDef.indexDigits ? arrayDef.indexDigits : 0;
			const prop = i.toString().padStart(chars, '0');
			const childDef = arrayDef.items;
			if (childDef._type && childDef._type !== 'array') {
				let valType: ValType = 'string';
				if (childDef._type === 'boolean') valType = 'boolean';
				if (childDef._type === 'number') valType = 'number';
				valTreeType[prop] = valType;
				children.push(leafDefInstString(childDef as MixerDefLeaf, prop));
			} else {
				valTreeType[prop] = {};
				const childName = createNodes(
					childDef,
					mixerName,
					[...address, '_ITEM_'],
					baseNodes,
					valTreeType[prop] as ValTreeType
				);
				children.push([
					`'${prop}': ${childName}`,
					`'${prop}': new ${childName}(this, [...this.address, '${prop}'])`,
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
				valTreeType[prop] = valType;
				children.push(leafDefInstString(childDef as MixerDefLeaf, prop));
			} else {
				valTreeType[prop] = {};
				const childName = createNodes(
					childDef,
					mixerName,
					[...address, prop],
					baseNodes,
					valTreeType[prop] as ValTreeType
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
	let rtn = '{\r\n';
	for (const [rawProp, val] of Object.entries(valTree)) {
		const prop = !isNaN(rawProp as any) ? `'${rawProp}'` : rawProp;
		if (typeof val === 'string') {
			rtn += `${tabs(level + 1)}${prop}: ${val};\r\n`;
		} else {
			rtn += `${tabs(level + 1)}${prop}: ${tsStringifyType(val, level + 1)}`;
		}
	}
	rtn += `${tabs(level)}};\r\n`;
	return rtn;
}

function tabs(num: number) {
	let rtn = '';
	for (let i = 0; i < num; i++) rtn += '\t';
	return rtn;
}

function defToString(def: MixerDefLeaf): string {
	const defProps: string[] = [];
	for (const [prop, val] of Object.entries(def)) {
		defProps.push(
			`${prop}: ${typeof val === 'string' ? `'` : ''}${val.toString()}${
				typeof val === 'string' ? `'` : ''
			}`
		);
	}
	return `{${defProps.join(', ')}}`;
}

function leafDefInstString(def: MixerDefLeaf, prop: string): [string, string] {
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
		)}, this, [...this.address, '${prop}'])`,
	];
}
