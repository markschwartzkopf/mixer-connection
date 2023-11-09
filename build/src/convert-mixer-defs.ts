import * as fsPromises from 'fs/promises';
import mixers from './mixer-definitions/all-mixers';
const classNames: string[] = [];

fsPromises.readFile('.././base/node.ts').then((val) => {
	const [root, child] = val.toString().split('\r\n\r\n');
	for (const [mixerName, def] of Object.entries(mixers)) {
		createNodes(def, mixerName, [], root, child);
	}
});

function createNodes(
	def: MixerDefNode,
	mixerName: string,
	address: string[],
	rootCode: string,
	childCode: string
): string {
	//replace class name
	const addressString =
		address.length === 0 ? 'Root' : address.map(capitalize).join('');
	const className = `${capitalize(mixerName)}${addressString}Node`;
	//verify name not already taken?
	classNames.push(className);
	let code = address.length === 0 ? rootCode : childCode;
	code = code.replace(
		address.length === 0 ? 'ROOT_NODE_NAME' : 'CHILD_NODE_NAME',
		className
	);

	//populate children
	const children: { prop: string; className: string }[] = [];
	for (const [prop, childDef] of Object.entries(def)) {
		if (childDef._type) {
			//Handle leaf
		} else {
			children.push({
				prop: prop,
				className: createNodes(
					childDef,
					mixerName,
					[...address, prop],
					rootCode,
					childCode
				),
			});
		}
	}
	code = code.replace(
		'/* CHILDREN */',
		children.map((child) => `${child.prop}: new ${child.className}(this)`).join(',\r\n')
	); //should clean up tabs?
	console.log(code);
	console.log('');
	return className;
}

//populate address?

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
