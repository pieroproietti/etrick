/**
 * packet.js
 * 
 * author: Piero Proietti <piero.proietti@gmail.com>
 * 
 */
import { readIp, readMacAddress } from './utils';
import get_convert from './packet/converters';

/**
 * 
 */
// @ts-expect-error TS(2300): Duplicate identifier 'Packet'.
class Packet {
    // @ts-expect-error TS(7006): Parameter 'array' implicitly has an 'any' type.
    constructor(array) {
        var key;
        for (key in array) {
            if (array.hasOwnProperty(key)) {
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                this[key] = array[key];
            }
        }
    }

    /**
     * 
     * @returns 
     */
    getRequestedIPAddress() {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return this.options[50];
    }

    /**
     * 
     * @param {*} op 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'op' implicitly has an 'any' type.
    op(op) {
        this.op = op;
        return this;
    }

    /**
     * 
     * @param {*} htype 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'htype' implicitly has an 'any' type.
    htype(htype) {
        this.htype = htype;
        return this;
    }

    /**
     * 
     * @param {*} hlen 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'hlen' implicitly has an 'any' type.
    hlen(hlen) {
        this.hlen = hlen;
        return this;
    }
    // @ts-expect-error TS(7006): Parameter 'hops' implicitly has an 'any' type.
    hops(hops) {
        this.hops = hops;
        return this;
    }

    /**
     * 
     * @param {*} xid 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'xid' implicitly has an 'any' type.
    xid(xid) {
        this.xid = xid;
        return this;
    }

    /**
     * 
     * @param {*} secs 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'secs' implicitly has an 'any' type.
    secs(secs) {
        this.secs = secs;
        return this;
    }
    // @ts-expect-error TS(7006): Parameter 'flags' implicitly has an 'any' type.
    flags(flags) {
        this.flags = flags;
        return this;
    }

    /**
     * 
     * @param {*} ciaddr 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'ciaddr' implicitly has an 'any' type.
    ciaddr(ciaddr) {
        this.ciaddr = ciaddr !== null ? ciaddr : '0.0.0.0';
        return this;
    }

    /**
     * 
     * @param {*} yiaddr 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'yiaddr' implicitly has an 'any' type.
    yiaddr(yiaddr) {
        this.yiaddr = yiaddr !== null ? yiaddr : '0.0.0.0';
        return this;
    }

    /**
     * 
     * @param {*} siaddr 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'siaddr' implicitly has an 'any' type.
    siaddr(siaddr) {
        this.siaddr = siaddr !== null ? siaddr : '0.0.0.0';
        return this;
    }

    /**
     * 
     * @param {*} giaddr 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'giaddr' implicitly has an 'any' type.
    giaddr(giaddr) {
        this.giaddr = giaddr !== null ? giaddr : '0.0.0.0';
        return this;
    }

    /**
     * 
     * @param {*} chaddr 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'chaddr' implicitly has an 'any' type.
    chaddr(chaddr) {
        this.chaddr = chaddr;
        return this;
    }

    /**
     * 
     * @param {*} sname 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'sname' implicitly has an 'any' type.
    sname(sname) {
        this.sname = sname;
        return this;
    }

    /**
     * 
     * @param {*} fname 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'fname' implicitly has an 'any' type.
    fname(fname) {
        this.fname = fname;
        return this;
    }

    /**
     * 
     * @param {*} options 
     * @returns 
     */
    // @ts-expect-error TS(7006): Parameter 'options' implicitly has an 'any' type.
    options(options) {
        this.options = options;
        return this;
    }
}


/**
 * 
 * @param {*} str 
 * @returns 
 */
// @ts-expect-error TS(7006): Parameter 'str' implicitly has an 'any' type.
function stripBinNull(str) {
    var pos;
    pos = str.indexOf('\u0000');
    if (pos === -1) {
        return str;
    } else {
        return str.substr(0, pos);
    }
}

/**
 * 
 * @param {*} b 
 * @returns 
 */
// @ts-expect-error TS(2300): Duplicate identifier 'fromBuffer'.
var fromBuffer = function (b) {
    var i, optLen, optNum, optVal, options, ret, _ref;
    ret = {
        op: b[0],
        htype: b[1],
        hlen: b.readUInt8(2),
        hops: b.readUInt8(3),
        xid: b.readUInt32BE(4),
        secs: b.readUInt16BE(8),
        flags: b.readUInt16BE(10),
        ciaddr: readIp(b, 12),
        yiaddr: readIp(b, 16),
        siaddr: readIp(b, 20),
        giaddr: readIp(b, 24),
        chaddr: readMacAddress(b.slice(28, 28 + b.readUInt8(2))),
        sname: stripBinNull(b.toString('ascii', 44, 108)),
        fname: stripBinNull(b.toString('ascii', 108, 236)),
        options: {}
    };
    _ref = [0, b.slice(240)]; i = _ref[0]; options = _ref[1];
    while (i < options.length && options[i] !== 255) {
        optNum = parseInt(options[i++], 10);
        optLen = parseInt(options[i++], 10);
        var converter = get_convert(optNum);
        optVal = converter.decode(options.slice(i, i + optLen), optNum);
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ret.options[optNum] = optVal;
        i += optLen;
    }
    return new Packet(ret);
};

/**
 * 
 * @returns 
 */
// @ts-expect-error TS(2300): Duplicate identifier 'toBuffer'.
var toBuffer = function () {
    var buffer, hex, i, key, octet, opt, padded, pos, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    buffer = new Buffer.alloc(512, 0x00, 'ascii');
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer[0] = this.op;
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer[1] = this.htype;
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer.writeUInt8(this.hlen, 2);
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer.writeUInt8(this.hops, 3);
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer.writeUInt32BE(this.xid, 4);
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer.writeUInt16BE(this.secs, 8);
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer.writeUInt16BE(this.flags, 10);
    pos = 12;
    _ref = ["ciaddr", "yiaddr", "siaddr", "giaddr"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        _ref1 = (this[key] || "0.0.0.0").split(".");
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            octet = _ref1[_j];
            buffer.writeUInt8(parseInt(octet, 10), pos++);
        }
    }
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    _ref2 = this.chaddr.split(':');
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        hex = _ref2[_k];
        buffer[pos++] = parseInt(hex, 16);
    }
    buffer.fill(0, 43, 235);
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    buffer.write(this.sname, 43, 64, 'ascii');
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    if (typeof this.fname === 'string' || this.fname instanceof String) {
        // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        buffer.write(this.fname, 108, 128, 'ascii');
    }
    pos = 236;
    _ref3 = [99, 130, 83, 99];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        i = _ref3[_l];
        buffer[pos++] = i;
    }
    pos = 240;
    // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    for (opt in this.options) {
        // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (this.options.hasOwnProperty(opt)) {
            // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            value = this.options[opt];
            var converter = get_convert(opt);
            pos = converter.encode(buffer, opt, value, pos);
        }
    }
    buffer[pos] = 255;
    // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    padded = new Buffer.alloc(pos, 0x00, 'ascii');
    buffer.copy(padded, 0, 0, pos);
    return padded;
};

// @ts-expect-error TS(2339): Property 'fromBuffer' does not exist on type 'type... Remove this comment to see the full error message
Packet.fromBuffer = fromBuffer;
// @ts-expect-error TS(2339): Property 'toBuffer' does not exist on type 'Packet... Remove this comment to see the full error message
Packet.prototype.toBuffer = toBuffer;

// @ts-expect-error TS(2300): Duplicate identifier 'Packet'.
export const Packet = Packet;
// @ts-expect-error TS(2300): Duplicate identifier 'fromBuffer'.
export const fromBuffer = fromBuffer;
// @ts-expect-error TS(2300): Duplicate identifier 'toBuffer'.
export const toBuffer = toBuffer;
