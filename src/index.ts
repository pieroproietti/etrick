/**
 * index.js: just export
 */
import { IDhcpOptions } from './interfaces/i-pxe'
interface IEtrick {
    _events: object
    _eventsCount: object
    _maxListeners: object
    network: string
    netmask: string
    broadcast: string
    host: string
    tftpserver: string
    bios_filename: string
    efi32_filename: string
    efi64_filename: string
    s: object // server
    p: object // proxy
}
import etrick from './classes/etrick'

export const MessageTypes = require('./lib/packet/message-types').default
export const Options = require('./lib/packet/options').default
export default etrick 

const dhcpOptions: IDhcpOptions = {
    subnet: "24",
    host: "192.168.1.120",
    tftpserver: "192.168.1.120",
    bios_filename: 'lpxelinux.0',
    efi32_filename: 'ipxe32.efi',
    efi64_filename: 'ipxe.efi',
}
