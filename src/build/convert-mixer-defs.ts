import * as fsPromises from 'fs/promises';
import mixers from './mixer-definitions/all-mixers';
import { MixerDefNode, MixerDefArray, MixerDefLeaf } from '../mixer-node-leaf';
const classNames: string[] = [];
const nodes: string[] = [];
const rootNodes: [string, string][] = [];
const mixerNames: string[] = [];
let warning = '';

fsPromises
	.readFile('./src/build/base/node.ts')
	.then((val) => {
		const [root, child, , warningIn] = val.toString().split('\r\n\r\n');
		warning = warningIn;
		const baseNodes = { root: root, child: child };
		nodes.push(
			warning,
			`import { MixerLeaf, MixerNode, MixerDefLeafBoolean, MixerDefLeafEnum, MixerDefLeafNumber, MixerDefLeafString } from '../src/mixer-node-leaf';`
		);
		for (const [mixerName, def] of Object.entries(mixers)) {
			mixerNames.push(mixerName);
			rootNodes.push([mixerName, createNodes(def, mixerName, [], baseNodes)]);
		}
		nodes.push(`export type MixerModel = '${mixerNames.join(`' | '`)}';`);
		nodes.push(
			`export const mixerRoots = {${rootNodes
				.map((x) => `${x[0]}: new ${x[1]}()`)
				.join(', ')}};`
		);
		nodes.push(`export type MixerRoots = typeof mixerRoots;`);
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
	baseNodes: { root: string; child: string }
): string {
	//replace class name
	const addressString =
		address.length === 0 ? 'Root' : address.map(capitalize).join('');
	const className = `${capitalize(mixerName)}${addressString}Node`;
	if (classNames.includes(className)) return className;
	classNames.push(className);
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
				children.push(leafDefInstString(childDef as MixerDefLeaf, prop));
			} else {
				const childName = createNodes(
					childDef,
					mixerName,
					[...address, '_ITEM_'],
					baseNodes
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
				children.push(leafDefInstString(childDef as MixerDefLeaf, prop));
			} else {
				const childName = createNodes(
					childDef,
					mixerName,
					[...address, prop],
					baseNodes
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

function tsStringify(val: unknown) {
	return JSON.stringify(val)
		.replace(/"/g, `'`)
		.replace(/'([^']+)':/g, '$1:');
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
