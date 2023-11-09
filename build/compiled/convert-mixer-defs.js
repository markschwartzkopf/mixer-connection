"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fsPromises = __importStar(require("fs/promises"));
const all_mixers_1 = __importDefault(require("./mixer-definitions/all-mixers"));
const classNames = [];
fsPromises.readFile('.././base/node.ts').then((val) => {
    const [root, child] = val.toString().split('\r\n\r\n');
    for (const [mixerName, def] of Object.entries(all_mixers_1.default)) {
        createNodes(def, mixerName, [], root, child);
    }
});
function createNodes(def, mixerName, address, rootCode, childCode) {
    //replace class name
    const addressString = address.length === 0 ? 'Root' : address.map(capitalize).join('');
    const className = `${capitalize(mixerName)}${addressString}Node`;
    //verify name not already taken?
    classNames.push(className);
    let code = address.length === 0 ? rootCode : childCode;
    code = code.replace(address.length === 0 ? 'ROOT_NODE_NAME' : 'CHILD_NODE_NAME', className);
    //populate children
    const children = [];
    for (const [prop, childDef] of Object.entries(def)) {
        if (childDef._type) {
            //Handle leaf
        }
        else {
            children.push({
                prop: prop,
                className: createNodes(childDef, mixerName, [...address, prop], rootCode, childCode),
            });
        }
    }
    code = code.replace('/* CHILDREN */', children.map((child) => `${child.prop}: new ${child.className}(this)`).join(',\r\n')); //should clean up tabs?
    console.log(code);
    console.log('');
    return className;
}
//populate address?
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
