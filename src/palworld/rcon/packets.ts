import { RCONPacketType } from './types';

const ENCODING: BufferEncoding = 'utf8';

export default class RCONPacket {
  private _buffer: Buffer;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  public get buffer(): Buffer {
    return this._buffer;
  }

  public get payloadLength(): number {
    return this.buffer.readInt32LE(0);
  }

  public get requestId(): number {
    return this.buffer.readInt32LE(4);
  }

  public get type(): RCONPacketType {
    return this.buffer.readInt32LE(8);
  }

  public get payload(): string {
    return this.buffer.toString(ENCODING, 12, 12 + this.payloadLength - 2);
  }

  public toString(): string {
    return `RCONPacket { payloadLength: ${this.payloadLength}, requestId: ${this.requestId}, type: ${this.type}, payload: ${this.payload} }`;
  }

  static randomId(): number {
    return Number.parseInt(Math.random().toString(2).substring(2, 32), 2);
  }

  static createFrom(requestId: number, type: RCONPacketType, payload: string): RCONPacket {
    // payload length in bytes
    const size = Buffer.byteLength(payload, ENCODING) + 14;

    // RCON packet with length of length(4) + id(4) + type (4) + payload + padding(2)
    const packet = Buffer.alloc(size);

    // Write length of packet - 4 bytes
    packet.writeInt32LE(size - 4, 0); // length of packet
    packet.writeInt32LE(requestId, 4); // request id
    packet.writeInt32LE(type, 8); // type
    packet.write(payload, 12, size - 2, ENCODING); // payload
    packet.writeInt16LE(0, size - 2); // 2 bytes of padding

    return new RCONPacket(packet);
  }
}
