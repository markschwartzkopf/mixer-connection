import EventEmitter from 'events';
import * as dgram from 'dgram';
import { MixerModule, MixerStatus, NodeValue } from './types';
import { bufferToOscCmd, OscCmd, oscCmdToBuffer } from './oscUtils';

export class X32 extends EventEmitter implements MixerModule {
	private _status: MixerStatus;
	private _udpSocket: dgram.Socket;
	readonly address: string;

	constructor(address: string) {
		super();
		this._status = 'CONNECTING';
		this._udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
		this._udpInit();
		this.address = address;
	}

	setNode(address: string[], value: NodeValue): Promise<void> {
		return new Promise((res, rej) => {
			rej('code this');
		});
	}

	getNode(address: string[], value: NodeValue): Promise<NodeValue> {
		return new Promise((res, rej) => {
			rej('code this');
		});
	}

	get status() {
		return this._status;
	}

	private _udpInit() {
		this._udpSocket.on('close', () => {
			this._status = 'CLOSED';
			this.emit('closed');
		});
		this._udpSocket.on('error', (err) => {
			this.emit('error', err);
		});
		this._udpSocket.on('message', (buf) => {
			const oscCmd = bufferToOscCmd(buf);
      console.log(oscCmd);
		});
		this._udpSocket.on('connect', () => {
			this._send({cmd: '/info'});
		});
		this._udpSocket.bind(0, '0.0.0.0', () => {
			this._udpSocket.connect(10023, this.address);
		});
	}

	private _send(oscCmd: OscCmd) {
		this._udpSocket.send(oscCmdToBuffer(oscCmd), (err) => {
			if (err) this.emit('error', err);
		});
	}
}


