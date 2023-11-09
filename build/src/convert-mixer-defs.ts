import * as fsPromises from 'fs/promises';
import mixers from './mixer-definitions/all-mixers';
const classNames: string[] = [];
const nodes: string[] = [`import { MixerLeaf } from '../src/mixer-leaf';\r\n`];

fsPromises
  .readFile('../base/node.ts')
  .then((val) => {
    const [root, child, array] = val.toString().split('\r\n\r\n');
    const baseNodes = { root: root, child: child, array: array };
    for (const [mixerName, def] of Object.entries(mixers)) {
      createNodes(def, mixerName, [], baseNodes);
    }
    fsPromises.writeFile('../temp/temp.ts', nodes.join('\r\n')).catch((err) => {
      console.error(err);
    });
  })
  .catch((err) => {
    console.error(err);
  });

function createNodes(
  def: MixerDefNode,
  mixerName: string,
  address: string[],
  baseNodes: { root: string; child: string; array: string }
): string {
  //replace class name
  const addressString =
    address.length === 0 ? 'Root' : address.map(capitalize).join('');
  const className = `${capitalize(mixerName)}${addressString}Node`;
  //verify name not already taken?
  classNames.push(className);
  let code = address.length === 0 ? baseNodes.root : baseNodes.child;
  code = code.replace(
    address.length === 0 ? 'ROOT_NODE_NAME' : 'CHILD_NODE_NAME',
    className
  );

  //populate children
  const children: string[] = [];
  for (const [rawProp, childDef] of Object.entries(def)) {
    const prop = !isNaN(rawProp as any) ? `'${rawProp}'` : rawProp;
    if (childDef._type) {
      if (childDef._type === 'array') {
        const props: string[] = [];
        if (
          Number.isInteger(childDef.start) &&
          Number.isInteger(childDef.end) &&
          childDef.end > childDef.start &&
          (!childDef.indexDigits || Number.isInteger(childDef.indexDigits))
        ) {
          for (let i = childDef.start; i <= childDef.end; i++) {
            let prop = i.toString();
            if (childDef.indexDigits)
              prop = prop.padStart(childDef.indexDigits, '0');
            props.push(prop);
          }
          //more code here :)
        } else console.error('Bad array format in mixer definition');
      } else
        children.push(
          leafDefInstString(childDef as MixerDefLeaf, prop, address)
        );
    } else {
      children.push(
        `${prop}: new ${createNodes(
          childDef,
          mixerName,
          [...address, prop],
          baseNodes
        )}(this)`
      );
    }
  }
  code = code.replace('/* CHILDREN */', children.join(',\r\n\t\t'));

  //populate address
  code = code.replace('address = []', `address = ${tsStringify(address)}`);

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

function leafDefInstString(
  def: MixerDefLeaf,
  prop: string,
  address: string[]
): string {
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
  return `${prop}: new MixerLeaf<${type}>(${defToString(
    def
  )}, this, ${tsStringify([...address, prop])})`;
}
