type OscArgument =
	| { type: 'i'; data: number }
	| { type: 'f'; data: number }
	| { type: 's'; data: string }
	| { type: 'b'; data: Buffer };

export type OscCmd = { cmd: string; args?: OscArgument[] };

export function oscCmdToBuffer(oscCmd: OscCmd): Buffer {
	const args = oscCmd.args ? oscCmd.args : [];
	const cmdBuf = stringToBuffer(oscCmd.cmd);
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
	return Buffer.concat([cmdBuf, typesBuf, argsBuf]);
}

export function bufferToOscCmd(buf: Buffer): OscCmd | Error {
  //get cmd:
	let split = buf.indexOf(0);
	if (split === -1) return new Error('Bad OSC Buffer format: no null bytes');
	const oscCmd: OscCmd = { cmd: buf.slice(0, split).toString() };
	split++;
	split = Math.ceil(split / 4) * 4;
	buf = buf.slice(split);

  //get argument formats:
	split = buf.indexOf(0);
	if (split === -1)
		return new Error('Bad OSC Buffer format: missing null byte');
	const argFormats = buf.slice(0, split).toString().split('');
	if (argFormats[0] != ',')
		return new Error('Bad OSC Buffer format: no format(s)');
	argFormats.shift();
  split = Math.ceil(split / 4) * 4;
	buf = buf.slice(split);

  //get arguments declared in format section
	for (let i = 0; i < argFormats.length; i++) {
		if (buf.length < 4)
			return new Error(
				'Bad OSC Buffer format: missing argument(s) with declared format(s)'
			);
		let bufEnd = 4;
		switch (argFormats[i]) {
			case 's':
				{
					const stringSize = buf.indexOf(0);
					if (stringSize == -1)
						return new Error('Bad OSC Buffer format: missing null byte');
					bufEnd = stringSize + 1;
					bufEnd = Math.ceil(bufEnd / 4) * 4;
					const oscArgument: OscArgument = {
						type: 's',
						data: buf.slice(0, stringSize).toString(),
					};
					if (oscCmd.args) {
						oscCmd.args.push(oscArgument);
					} else oscCmd.args = [oscArgument];
				}
				break;
			default:
				return new Error('Unknown OSC argument format: ' + argFormats[i]);
				break;
		}
		buf = buf.slice(bufEnd);
	}
	if (buf.length > 0)
		return new Error('Bad OSC Buffer format: data without format');
	return oscCmd;
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
