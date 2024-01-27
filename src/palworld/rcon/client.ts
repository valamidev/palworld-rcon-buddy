import { Socket } from 'net';

import { RCONPacketType } from './types';
import RCONPacket from './packets';

export default class RCONClient {
  host: string;
  port: number;

  socket: Socket;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;

    this.socket = new Socket();
  }

  connect(password: string): Promise<RCONClient> {
    const authPacket = RCONPacket.createFrom(1, RCONPacketType.AUTH, password);

    return new Promise<RCONClient>((resolve, reject) => {
      const onConnect = () => {
        this.socket.write(authPacket.buffer);
      };

      const onData = (data: Buffer) => {
        const packet = new RCONPacket(data);

        if (packet.requestId === -1) {
          this.socket.destroy(new Error('Authentication failed'));
          return;
        }

        if (packet.type === RCONPacketType.COMMAND && packet.requestId === authPacket.requestId) {
          this.socket.removeListener('error', reject);
          resolve(this);
          return;
        }

        this.socket.destroy(new Error('Unknown packet'));
      };

      this.socket.once('error', reject).once('data', onData).once('connect', onConnect).connect(this.port, this.host);
    }).catch((err) => {
      this.socket.destroy();
      throw err;
    });
  }

  sendCommand(command: string): Promise<string> {
    const cmdPacket = RCONPacket.createFrom(0, RCONPacketType.COMMAND, command);
    const endPacket = RCONPacket.createFrom(cmdPacket.requestId + 1, RCONPacketType.COMMAND_END, '');

    let result = '';
    let onData: (data: Buffer) => void;

    const onDataFunc = (resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
      return (data: Buffer) => {
        const packet = new RCONPacket(data);

        if (packet.type === RCONPacketType.RESPONSE && packet.requestId === cmdPacket.requestId) {
          result = packet.payload;

          resolve(result);

          return;
        }

        if (packet.type === RCONPacketType.RESPONSE && packet.requestId === endPacket.requestId) {
          this.socket.off('error', reject);
          resolve(result);
          return;
        }
      };
    };

    return new Promise<string>((resolve, reject) => {
      onData = onDataFunc(resolve, reject);

      this.socket.once('error', reject).on('data', onData).write(cmdPacket.buffer);

      this.socket.write(endPacket.buffer);
    }).then((response) => {
      this.socket.off('data', onData);
      return response;
    });
  }
}
