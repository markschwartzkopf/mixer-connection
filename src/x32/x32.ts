import EventEmitter from 'events';
import * as dgram from 'dgram';
import { MixerModule, MixerStatus, NodeValue, ModuleEvents } from '../types';
import { bufferToOscMsg, OscMsg, oscMsgToBuffer } from '../oscUtils';

const REQUIRED_FIRMWARE_VERSION = '4.06';

//Not sure why this doesn't get imported with MixerModule:
export interface X32 {
	on<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
	once<U extends keyof ModuleEvents>(event: U, listener: ModuleEvents[U]): this;
	emit<U extends keyof ModuleEvents>(
		event: U,
		...args: Parameters<ModuleEvents[U]>
	): boolean;
}

export class X32 extends EventEmitter implements MixerModule {
	private _status: MixerStatus;
	private _udpSocket: dgram.Socket;
	readonly address: string;
	private _heartbeat: NodeJS.Timer | null = null;
	private _lastValidMessage = Date.now();

	constructor(address: string) {
		super();
		this.address = address;
		this._status = 'CONNECTING';
		this._udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
		this._connect()
			.then(() => {
				this._heartbeat = setInterval(() => {
					const time = Math.round((Date.now() - this._lastValidMessage) / 1000);
					if (time > 20) {
						this.emit(
							'error',
							new Error(
								'It has been ' +
									time +
									' seconds since last valid message from X32. Closing connection'
							)
						);
						this.close();
					} else if (time > 10) {
						//poke the X32 since it's been a while since a msg:
						this._send({ address: '/config/chlink/1-2' });
					}
				}, 5000);
			})
			.catch((err) => {
				console.log('rejected');
				this.emit('error', new Error(err));
			});
	}

	close() {
		this.emit('info', 'Closing connection to X32');
		this._status = 'CLOSED';
		//if (this._subscription) clearInterval(this._subscription);
		if (this._heartbeat) clearInterval(this._heartbeat);
		this._udpSocket.close();
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

	private _connect() {
		return new Promise<void>((res, rej) => {
			let initTimeout: NodeJS.Timeout | null = null;
			this._udpSocket.on('close', () => {
				if (this._heartbeat) clearInterval(this._heartbeat);
				this._status = 'CLOSED';
				this.emit('closed');
			});
			this._udpSocket.on('error', (err) => {
				this.emit('error', err);
			});
			this._udpSocket.on('message', (buf) => {
				this._processMsgFromX32(buf);
			});
			this.once('connected', () => {
				if (initTimeout) clearTimeout(initTimeout);
				res();
			});
			this._udpSocket.on('connect', () => {
				initTimeout = setTimeout(() => {
					rej('XM32 not responding to initialization message');
					this._udpSocket.close();
				}, 2000);
				this._send({ address: '/xinfo' });
			});
			this._udpSocket.bind(0, '0.0.0.0', () => {
				this._udpSocket.connect(10023, this.address);
			});
		});
	}

	private _processMsgFromX32(buf: Buffer) {
		const oscMsg = bufferToOscMsg(buf);
		if (oscMsg.args === 'Error') {
			this.emit('error', new Error(oscMsg.address));
		} else {
			this._lastValidMessage = Date.now();
			switch (oscMsg.address) {
				case '/xinfo':
					if (this._status !== 'CONNECTED') {
						this._status = 'CONNECTED';
						this.emit('connected');
						if (
							!oscMsg.args ||
							!oscMsg.args[3] ||
							oscMsg.args[3].data !== REQUIRED_FIRMWARE_VERSION ||
							oscMsg.args[2].type !== 's' ||
							oscMsg.args[1].type !== 's' ||
							oscMsg.args[0].type !== 's'
						) {
							this.emit(
								'error',
								new Error(
									'Could not verify XM32 firmware version is ' +
										REQUIRED_FIRMWARE_VERSION
								)
							);
						} else {
							this.emit(
								'info',
								`Connected to ${oscMsg.args[2].data} named ${oscMsg.args[1].data} at ${oscMsg.args[0].data}`
							);
              console.log('ye');
							this._send({
								address: '/ch/01/mix',
							});
						}
					}
					break;
				default:
					break;
			}
		}
	}

	private _send(oscMsg: OscMsg) {
		this._udpSocket.send(oscMsgToBuffer(oscMsg), (err) => {
			if (err) this.emit('error', err);
		});
	}
}
