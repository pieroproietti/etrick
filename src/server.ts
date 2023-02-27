/**
 * server.js
 *
 */

import { Socket } from 'dgram'
import { Packet } from './packet'
import MessageTypes from './packet/message-types'
import { log, inherits } from 'util'

/**
 *
 */
class DHCPServer extends Socket {
  broadcast: any;
  constructor (type: any, opts: any) {
    super(type)
    const _this = this
    _this.broadcast = opts.broadcast
    this.on('error', function (err) {
      console.dir(err)
    })
    this.on('message', function (buffer, remote) {
      let event_name, packet, type
      // @ts-expect-error TS(2339): Property 'fromBuffer' does not exist on type 'type... Remove this comment to see the full error message
      packet = Packet.fromBuffer(buffer)
      if (packet.op === 1) {
        type = {
          id: packet.options[53] || 0,
          name: MessageTypes[packet.options[53] || 0]
        }
        log(('Got ' + type.name + ' from') + (' ' + remote.address + ':' + remote.port + ' (' + packet.chaddr + ') ') + (' with packet length of ' + buffer.length + ' bytes'))
        event_name = type.name.replace('DHCP', '').toLowerCase()
        packet.remote = remote
        return _this._emitPacket(event_name, packet)
      } else {
        return console.log('  Unsupported message format')
      }
    })
    return _this
  }

  /**
     *
     * @param {*} port
     * @param {*} addr
     * @param {*} cb
     * @returns
     */
  // @ts-expect-error TS(2416): Property 'bind' in type 'DHCPServer' is not assign... Remove this comment to see the full error message
  bind (port: any, addr: any, cb: any) {
    const self = this
    let res
    // Andrebbe sostituito...
    // @ts-expect-error TS(2339): Property 'super_' does not exist on type 'typeof D... Remove this comment to see the full error message
    res = DHCPServer.super_.prototype.bind.call(this, port, addr, function(this: any) {
      this.setBroadcast(true)
      if (cb instanceof Function) { cb() }
    })
    return res
  }

  /**
     *
     * @param {*} event_name
     * @param {*} ip
     * @param {*} packet
     * @returns
     */
  _send (event_name: any, ip: any, packet: any) {
    let buffer; const _this = this
    buffer = packet.toBuffer()
    log(('Sending ' + MessageTypes[packet.options[53]]) + (' to ' + ip + ':68 (' + packet.chaddr + ')') + (' with packet length of ' + buffer.length + ' bytes'))
    this.emit(event_name, packet)
    return this.send(buffer, 0, buffer.length, 68, ip, function (err, bytes) {
      if (err) {
        return _this.emit('' + event_name + 'Error', err, packet)
      } else {
        return _this.emit('' + event_name + 'Sent', bytes, packet)
      }
    })
  }

  /**
     *
     * @param {*} message_type
     * @param {*} packet
     * @returns
     */
  _emitPacket (message_type: any, packet: any) {
    return this.emit(message_type, packet, packet.options[50] || null)
  }

  /**
     *
     * @param {*} packet
     * @param {*} params
     */
  discover (packet: any, params: any) {
    console.log('Got DHCP DISCOVER')
  }

  /**
     *
     * @param {*} packet
     * @param {*} params
     * @returns
     */
  offer (packet: any, params: any) {
    if (params) {
      packet.yiaddr = params.yiaddr
      packet.siaddr = params.siaddr
      packet.options = params.options
    }
    packet.op = packet.options[53] = 2
    // return this._send('offer', this.broadcast, packet);
    return this._send('offer', '255.255.255.255', packet)
  }

  /**
     *
     * @param {*} packet
     * @param {*} params
     * @returns
     */
  ack (packet: any, params: any) {
    if (params) {
      packet.yiaddr = params.yiaddr
      packet.siaddr = params.siaddr
      packet.options = params.options
    }
    packet.op = 2
    packet.options[53] = 5
    return this._send('ack', this.broadcast, packet)
  }

  /**
     *
     * @param {*} packet
     * @param {*} params
     * @returns
     */
  nak (packet: any, params: any) {
    packet.op = 2
    packet.options[53] = 6
    return this._send('nak', packet.ciaddr, packet)
  }

  /**
     *
     * @param {*} packet
     * @param {*} params
     * @returns
     */
  inform (packet: any, params: any) {
    if (params) {
      packet.yiaddr = params.yiaddr
      packet.siaddr = params.siaddr
      packet.options = params.options
    }
    packet.op = 2
    packet.options[53] = 5
    return this._send('inform', packet.ciaddr, packet)
  }
}

/**
 * Poichè DHCPServer extents Socket non dovrebbe essere
 * più necessario, lo mantengo, finchè non trovo il
 * modo di sostituire:
 *
 * res = DHCPServer.super_.prototype.bind.call(this, port, addr, function () {
  */
inherits(DHCPServer, Socket)

// @ts-expect-error TS(2339): Property 'Packet' does not exist on type 'typeof D... Remove this comment to see the full error message
DHCPServer.Packet = Packet
export default DHCPServer
