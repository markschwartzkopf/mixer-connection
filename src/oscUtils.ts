export type oscMessage = {
	address: string[];
	args: oscArgument[];
	noSlash?: boolean;
};

export type oscArgument =
	| { type: 'i'; data: number }
	| { type: 'f'; data: number }
	| { type: 's'; data: string }
	| { type: 'b'; data: Buffer };

export function oscBufferToMessage(buf: Buffer): oscMessage | string {
	let split = buf.indexOf(0);
	let addressString = buf.subarray(0, split).toString();
	const noSlash = addressString[0] !== '/';
	if (addressString[0] === '/') addressString = addressString.slice(1);
	const address = addressString.split('/');
	split++;
	split = Math.ceil(split / 4) * 4;
	buf = buf.subarray(split);

	const rtn: oscMessage = { address: address, args: [] };
	if (noSlash) rtn.noSlash = true;
	if (buf.length === 0) return rtn; //no arguments. This is allowed per OSC spec, although disallowed in some implementations

	split = buf.indexOf(0);
	if (split == -1) return 'Incorrect OSC message: No type tag string';
	const format = buf.subarray(0, split).toString().split('');
	if (format[0] !== ',')
		return 'Incorrect OSC message: type tag string missing or not preceded by ","';
	format.shift();
	split = Math.ceil(split / 4) * 4;
	buf = buf.subarray(split);
	if (format.length == 0 && buf.length > 0)
		return 'OSC data without format indentifier';
	for (let i = 0; i < format.length; i++) {
		if (buf.length < 4) return 'OSC missing data claimed by type tag string';
		switch (format[i]) {
			case 'i':
				rtn.args.push({ type: 'i', data: buf.readInt32BE() });
				buf = buf.subarray(4);
				break;
			case 'f':
				rtn.args.push({ type: 'f', data: buf.readFloatBE() });
				buf = buf.subarray(4);
				break;
			case 's':
				{
					const stringSize = buf.indexOf(0);
					if (stringSize == -1)
						return 'OSC message missing string data claimed by type tag "s"';
					let bufEnd = stringSize + 1;
					bufEnd = Math.ceil(bufEnd / 4) * 4;
					rtn.args.push({
						type: 's',
						data: buf.subarray(0, stringSize).toString(),
					});
					buf = buf.subarray(bufEnd);
				}
				break;
			case 'b':
				{
					const blobSize = buf.readInt32BE();
					if (blobSize + 4 > buf.length)
						return 'OSC message missing data claimed by OSC blob size declaration';
					let bufEnd = 4 + blobSize;
					bufEnd = Math.ceil(bufEnd / 4) * 4;
					const blobData = buf.subarray(4, 4 + blobSize);
					buf = buf.subarray(bufEnd);
					rtn.args.push({ type: 'b', data: blobData });
				}
				break;
			default:
				return `Unrecognized OSC type tag: ${format[i]}`;
				break;
		}
	}
	if (buf.length !== 0) return 'Unexpected data in OSC message';
	return rtn;
}

export function oscMessageToBuffer(msg: oscMessage): Buffer {
	if (msg.args === undefined) msg.args = [];
	let addressString = msg.address.join('/');
	if (!msg.noSlash) addressString = '/' + addressString;
	const addressBuf = stringToBuffer(addressString);
	let argTypes = ',';
	const argBufs: Buffer[] = [];
	if (msg.args.length > 0) {
		for (let i = 0; i < msg.args.length; i++) {
			argTypes += msg.args[i].type;
			argBufs.push(oscArgumentToBuffer(msg.args[i]));
		}
	}
	const typesBuf = stringToBuffer(argTypes);
	const argsBuf = Buffer.concat(argBufs);
	return Buffer.concat([addressBuf, typesBuf, argsBuf]);
}

function stringToBuffer(str: string): Buffer {
	const buf = Buffer.from(str);
	const bufPad = Buffer.alloc(4 - (buf.length % 4));
	return Buffer.concat([buf, bufPad]);
}

function oscArgumentToBuffer(arg: oscArgument): Buffer {
	switch (arg.type) {
		case 'b':
			{
				const size = Buffer.alloc(4);
				size.writeInt32BE(arg.data.length);
				const bufPad = Buffer.alloc(4 - (arg.data.length % 4));
				return Buffer.concat([size, arg.data, bufPad]);
			}
			break;
		case 'f':
			{
				const floatBuf = Buffer.allocUnsafe(4);
				floatBuf.writeFloatBE(arg.data, 0);
				return floatBuf;
			}
			break;
		case 'i':
			{
				const intBuf = Buffer.allocUnsafe(4);
				intBuf.writeInt32BE(arg.data, 0);
				return intBuf;
			}
			break;
		case 's':
			return stringToBuffer(arg.data);
			break;
	}
}
