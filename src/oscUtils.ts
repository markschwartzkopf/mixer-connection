type OscArgument =
	| { type: 'i'; data: number }
	| { type: 'f'; data: number }
	| { type: 's'; data: string }
	| { type: 'b'; data: Buffer };

export type OscMsg = { address: string; args?: OscArgument[] };
type OscMsgError = { address: string; args: 'Error' };

export function oscMsgToBuffer(oscMsg: OscMsg): Buffer {
	const args = oscMsg.args ? oscMsg.args : [];
	const addressBuf = stringToBuffer(oscMsg.address);
	let argTypes = ',';
	const argBufs: Buffer[] = [];
	if (args.length > 0) {
		for (let i = 0; i < args.length; i++) {
			argTypes += args[i].type;
			argBufs.push(oscArgumentToBuffer(args[i]));
		}
	}
	const typesBuf = stringToBuffer(argTypes);
	const argsBuf = Buffer.concat(argBufs);
	return Buffer.concat([addressBuf, typesBuf, argsBuf]);
}

export function bufferToOscMsg(buf: Buffer): OscMsg | OscMsgError {
	//get address:
	let split = buf.indexOf(0);
	if (split === -1)
		return { args: 'Error', address: 'Bad OSC Buffer format: no null bytes' };
	const oscMsg: OscMsg = { address: buf.subarray(0, split).toString() };
	split++;
	split = Math.ceil(split / 4) * 4;
	buf = buf.subarray(split);

	//get argument formats:
	split = buf.indexOf(0);
	if (split === -1)
		return {
			args: 'Error',
			address: 'Bad OSC Buffer format: missing null byte',
		};
	const argFormats = buf.subarray(0, split).toString().split('');
	if (argFormats[0] != ',')
		return { args: 'Error', address: 'Bad OSC Buffer format: no format(s)' };
	argFormats.shift();
	split++;
	split = Math.ceil(split / 4) * 4;
	buf = buf.subarray(split);

	//get arguments declared in format section
	for (let i = 0; i < argFormats.length; i++) {
		if (buf.length < 4)
			return {
				args: 'Error',
				address:
					'Bad OSC Buffer format: missing argument(s) with declared format(s)',
			};
		let bufEnd = 4;
		let oscArgument: OscArgument | null = null;
		switch (argFormats[i]) {
			case 's':
				{
					const stringSize = buf.indexOf(0);
					if (stringSize == -1)
						return {
							args: 'Error',
							address: 'Bad OSC Buffer format: missing null byte',
						};
					bufEnd = stringSize + 1;
					bufEnd = Math.ceil(bufEnd / 4) * 4;
					oscArgument = {
						type: 's',
						data: buf.subarray(0, stringSize).toString(),
					};
				}
				break;
			case 'i':
				oscArgument = { type: 'i', data: buf.readInt32BE() };
				break;
			case 'f':
				oscArgument = { type: 'f', data: buf.readFloatBE() };
				break;
			case 'b':
				{
					const blobSize = buf.readInt32BE();
					if (blobSize + 4 > buf.length)
						return {
							args: 'Error',
							address: 'OSC from X32 missing data claimed by format: blob',
						};
					bufEnd = 4 + blobSize;
					bufEnd = Math.ceil(bufEnd / 4) * 4;
					const blobData = buf.subarray(4, 4 + blobSize);
					oscArgument = { type: 'b', data: blobData };
				}
				break;
			default:
				return {
					args: 'Error',
					address: 'Unknown OSC argument format: ' + argFormats[i],
				};
				break;
		}
		if (oscArgument) {
			if (oscMsg.args) {
				oscMsg.args.push(oscArgument);
			} else oscMsg.args = [oscArgument];
		}
		buf = buf.subarray(bufEnd);
	}
	if (buf.length > 0)
		return {
			args: 'Error',
			address: 'Bad OSC Buffer format: data without format',
		};
	console.log(oscMsg);
	return oscMsg;
}

function stringToBuffer(str: string): Buffer {
	const buf = Buffer.from(str);
	const bufPad = Buffer.alloc(4 - (buf.length % 4));
	return Buffer.concat([buf, bufPad]);
}

function oscArgumentToBuffer(arg: OscArgument): Buffer {
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
