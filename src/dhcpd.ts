/**
 * dhcpd
 * 
 * configured for dhcp-proxy
 * 
 * I toke that from: https://github.com/FOGProject/node-dhcproxy
 *         based on: https://github.com/glaszig/node-dhcpd/
 * 
 * author: Piero Proietti <piero.proietti@gmail.com>
 * 
 */
import dhcp_server from './server';
import dhcp_proxy from './proxy';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'netm... Remove this comment to see the full error message
import { Netmask as netmask } from 'netmask';
import { EventEmitter as ee } from 'events';
import { inherits } from 'util';

const
    BOOTREQUEST = 1,
    DHCP_MESSAGE_TYPE = 0x35,
    DHCP_SERVER_ID = 0x36,
    DHCP_DISCOVER = 1,
    DHCP_INFORM = 8,
    DHCP_MINTYPE = DHCP_DISCOVER,
    DHCP_MAXTYPE = DHCP_INFORM,
    DHCP_REQUESTED_IP = 0x32,
    DHCP_HOST_NAME = 0x0c;

// @ts-expect-error TS(2307): Cannot find module '../interfaces/i-pxe' or its co... Remove this comment to see the full error message
import { IDhcpOptions, IDhcpd, IPacket } from '../interfaces/i-pxe'


/**
 * 
 * @param opts 
 * @returns 
 */
class dhcpd {

    /**
     * 
     * @param opts 
     * @returns 
     */
    constructor(opts: any) {
        var self = this;
        if (!(self instanceof dhcpd)) {
            return new dhcpd(opts)
        }
        // @ts-expect-error TS(2345): Argument of type 'this' is not assignable to param... Remove this comment to see the full error message
        ee.call(self);
        if (opts.subnet) {
            let block = new netmask(opts.subnet)
            if (block) {
                // @ts-expect-error TS(2339): Property 'network' does not exist on type 'dhcpd'.
                self.network = block.base;
                // @ts-expect-error TS(2339): Property 'netmask' does not exist on type 'dhcpd'.
                self.netmask = block.mask;
                // @ts-expect-error TS(2339): Property 'broadcast' does not exist on type 'dhcpd... Remove this comment to see the full error message
                self.broadcast = block.broadcast;
                // @ts-expect-error TS(2339): Property 'host' does not exist on type 'dhcpd'.
                self.host = opts.host;
                // @ts-expect-error TS(2339): Property 'tftpserver' does not exist on type 'dhcp... Remove this comment to see the full error message
                self.tftpserver = opts.tftpserver;
                // @ts-expect-error TS(2339): Property 'bios_filename' does not exist on type 'd... Remove this comment to see the full error message
                self.bios_filename = opts.bios_filename;
                // @ts-expect-error TS(2339): Property 'efi32_filename' does not exist on type '... Remove this comment to see the full error message
                self.efi32_filename = opts.efi32_filename;
                // @ts-expect-error TS(2339): Property 'efi64_filename' does not exist on type '... Remove this comment to see the full error message
                self.efi64_filename = opts.efi64_filename;
            }
            else {
                throw new Error("Unable to read subnet details from '" + opts.subnet + "'");
            }
        }

        // Listen on port 67 for all the DHCP messages from clients
        // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
        self.s = new dhcp_server('udp4', { broadcast: self.broadcast });
        // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
        self.s.on('listening', function () {
            // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
            var address = self.s.address();
            console.log('server listening: ' + address.address + ':' + address.port);
        });
        // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
        self.s.on('discover', self.discover.bind(self));
        // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
        self.s.on('request', self.request.bind(self));
        // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
        self.s.on('inform', self.inform.bind(self));
        // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
        self.s.bind(67, '0.0.0.0');

        // Listen on port 4011 for clients asking for proxy DHCP
        // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
        self.p = new dhcp_proxy('udp4', { broadcast: self.broadcast });
        // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
        self.p.on('listening', function () {
            // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
            var address = self.p.address();
            console.log('proxy listening: ' + address.address + ':' + address.port);
        });
        // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
        self.p.on('request', self.proxy_request.bind(self));
        // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
        self.p.bind(4011, '0.0.0.0');

        return self;
    }

    /**
     * 
     * @param {*} pkt 
     * @returns 
     */
    pre_init(pkt: any) {
        var self = this;
        // Ignore malformed packets
        if (pkt.hlen != 6)
            return;
        // Ignore if not a BOOTREQUEST
        if (pkt.op != BOOTREQUEST)
            return;
        // Ignore if unknown message type
        var state = _get_option(pkt, DHCP_MESSAGE_TYPE);
        if (state == undefined || state['0'] < DHCP_MINTYPE || state['0'] > DHCP_MAXTYPE)
            return;
        // Ignore if DHCP message is not for us
        var server_id_opt = _get_option(pkt, DHCP_SERVER_ID);
        // @ts-expect-error TS(2339): Property 'host' does not exist on type 'dhcpd'.
        if (server_id_opt !== undefined && server_id_opt != self.host)
            return;
    }

    /**
     * 
     * @param {*} pkt 
     * @returns 
     */
    discover(pkt: any) {
        var self = this;
        console.log("Received DHCP DISCOVER");
        if (pkt.options['60'] !== undefined && pkt.options['60'].indexOf('PXEClient') === 0) {
            // Check if we are really being asked for PXE boot information
            // Signal the client that we are a proxy dhcp by sending an OFFER
            var offer = {};
            // @ts-expect-error TS(2339): Property 'siaddr' does not exist on type '{}'.
            offer.siaddr = self.host;
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options = {};
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options['60'] = 'PXEClient';
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options['54'] = self.host;
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options['255'] = null;
            self.pre_init(pkt);
            // @ts-expect-error TS(2339): Property 's' does not exist on type 'dhcpd'.
            return self.s.offer(pkt, offer);
        }
        else if (pkt.options['60'] !== undefined && pkt.options['60'].indexOf('AAPLBSDPC/i386') === 0) {
            console.log('Mac OS X discovery, ignoring');
            return;
        }
        else {
            console.log('Ignoring discovery as it does not seam to be a boot request');
            return;
        }

    }

    /**
     * 
     * @param {*} pkt 
     * @returns 
     */
    request(pkt: any) {
        var self = this;
        console.log('Ignoring received REQUEST from ' + pkt.chaddr + ' as we are only a proxy')
        return
    }

    /**
     * 
     * @param {*} pkt 
     * @returns 
     */
    inform(pkt: any) {
        var self = this;
        if (pkt.options['60'] !== undefined && pkt.options['60'].indexOf('AAPLBSDPC/i386') === 0) {
            var offer = {};
            // @ts-expect-error TS(2339): Property 'siaddr' does not exist on type '{}'.
            offer.siaddr = self.tftpserver;
            // @ts-expect-error TS(2339): Property 'ciaddr' does not exist on type '{}'.
            offer.ciaddr = pkt.remote.address;
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options = {};
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options['54'] = self.host;
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options['60'] = 'AAPLBSDPC';
            // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
            offer.options['255'] = null;
            if (pkt.options['43'] !== undefined && pkt.options['43'].indexOf('01:01:01') === 0) {
                // Mac OS X client: BSDP list
                // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
                offer.options['43'] = '01:01:01:04:02:80:00:07:04:81:00:05:2a:08:04:81:00:05:2a:09:0d:81:00:05:2a:08:69:50:58:45:2d:46:4f:47';
            }
            else if (pkt.options['43'] !== undefined && pkt.options['43'].indexOf('01:01:02') === 0) {
                // Mac OS X client: BSDP select
                // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
                offer.options['43'] = '01:01:02:08:04:81:00:05:2a:82:0a:4e:65:74:42:6f:6f:74:30:30:31';
                // @ts-expect-error TS(2339): Property 'efi64_filename' does not exist on type '... Remove this comment to see the full error message
                pkt.fname = self.efi64_filename;
                pkt.sname = '141.62.66.114';
            }
            else {
                console.log('Unknown BSDP request, not answering');
                return;
            }
            // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
            return self.p.ack(pkt, offer);
        }
        else {
            console.log('INFORM not by a Mac OS client, maybe Windows, ignoring');
            return;
        }
    }

    /**
     * 
     * @param {*} pkt 
     * @returns 
     */
    proxy_request(pkt: any) {
        var self = this;

        console.log("Received Proxy DHCP REQUEST");
        var offer = {};
        // @ts-expect-error TS(2339): Property 'siaddr' does not exist on type '{}'.
        offer.siaddr = self.tftpserver;
        // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
        offer.options = {};
        // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
        offer.options['54'] = self.host;
        // @ts-expect-error TS(2339): Property 'options' does not exist on type '{}'.
        offer.options['255'] = null;
        if (pkt.options['60'] !== undefined) {
            var arch = pkt.options['60'];
            if (arch.indexOf('00009') === 15 || arch.indexOf('00007') === 15) {
                // @ts-expect-error TS(2339): Property 'efi64_filename' does not exist on type '... Remove this comment to see the full error message
                var fname = self.efi64_filename;
                if (pkt.options["77"] === "iPXE") {
                    fname = `autoexec.ipxe`
                }
                pkt.fname = fname
            }
            else if (arch.indexOf('00006') === 15) {
                // @ts-expect-error TS(2339): Property 'efi32_filename' does not exist on type '... Remove this comment to see the full error message
                pkt.fname = self.efi32_filename;
            }
            else {
                // @ts-expect-error TS(2339): Property 'bios_filename' does not exist on type 'd... Remove this comment to see the full error message
                pkt.fname = self.bios_filename;
            }
        }
        // @ts-expect-error TS(2339): Property 'p' does not exist on type 'dhcpd'.
        return self.p.ack(pkt, offer);
    }
}

/**
 * 
 */
inherits(dhcpd, ee);

/**
 * 
 * @param {*} pkt 
 * @param {*} opt 
 * @returns 
 */
function _get_option(pkt: any, opt: any) {
    return (opt in pkt.options) ? pkt.options[opt] : undefined;
}

export default dhcpd;
