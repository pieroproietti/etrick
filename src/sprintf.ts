/**
 * sprintf.js
 *
 * used in dhcpd
 *
 * called from utils
 *
 */
export default function sprintf () {
  // Return a formatted string
  //
  // version: 1107.2516
  // discuss at: http://phpjs.org/functions/sprintf    // +   original by: Ash Searle (http://hexmen.com/blog/)
  // + namespaced by: Michael White (http://getsprink.com)
  // +    tweaked by: Jack
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Paulo Freitas    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: sprintf("%01.2f", 123.1);
  // *     returns 1: 123.10    // *     example 2: sprintf("[%10s]", 'monkey');
  // *     returns 2: '[    monkey]'
  // *     example 3: sprintf("[%'#10s]", 'monkey');
  // *     returns 3: '[####monkey]'
  const regex = /%%|%(\d+\$)?([\-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g
  const a = arguments
  let i = 0
  const format = a[i++]

  // pad()
  const pad = function (str: any, len: any, chr: any, leftJustify: any) {
    if (!chr) {
      chr = ' '
    }
    const padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr)
    return leftJustify ? str + padding : padding + str
  }

  // justify()
  const justify = function (value: any, prefix: any, leftJustify: any, minWidth: any, zeroPad: any, customPadChar: any) {
    const diff = minWidth - value.length
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = pad(value, minWidth, customPadChar, leftJustify)
      } else {
        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length)
      }
    }
    return value
  }
  // formatBaseX()
  const formatBaseX = function (value: any, base: any, prefix: any, leftJustify: any, minWidth: any, precision: any, zeroPad: any) {
    // Note: casts negative numbers to positive ones
    const number = value >>> 0
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    prefix = prefix && number && {
      2: '0b',
      8: '0',
      16: '0x'
    }[base] || ''
    value = prefix + pad(number.toString(base), precision || 0, '0', false)
    // @ts-expect-error TS(2554): Expected 6 arguments, but got 5.
    return justify(value, prefix, leftJustify, minWidth, zeroPad)
  }

  // formatString()
  const formatString = function (value: any, leftJustify: any, minWidth: any, precision: any, zeroPad: any, customPadChar: any) {
    if (precision !== null) {
      value = value.slice(0, precision)
    }
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
  }

  // doFormat()
  const doFormat = function (substring: any, valueIndex: any, flags: any, minWidth: any, _: any, precision: any, type: any) {
    let number
    let prefix
    let method
    let textTransform
    let value
    if (substring == '%%') {
      return '%'
    }

    // parse flags
    let leftJustify = false
    let positivePrefix = ''
    let zeroPad = false
    let prefixBaseX = false
    let customPadChar = ' '
    const flagsl = flags.length
    for (let j = 0; flags && j < flagsl; j++) {
      switch (flags.charAt(j)) {
        case ' ':
          positivePrefix = ' '
          break
        case '+':
          positivePrefix = '+'
          break
        case '-':
          leftJustify = true
          break
        case "'":
          customPadChar = flags.charAt(j + 1)
          break
        case '0':
          zeroPad = true
          break
        case '#':
          prefixBaseX = true
          break
      }
    }

    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (!minWidth) {
      minWidth = 0
    } else if (minWidth == '*') {
      minWidth = +a[i++]
    } else if (minWidth.charAt(0) == '*') {
      minWidth = +a[minWidth.slice(1, -1)]
    } else {
      minWidth = +minWidth
    }
    // Note: undocumented perl feature:
    if (minWidth < 0) {
      minWidth = -minWidth
      leftJustify = true
    }

    if (!isFinite(minWidth)) {
      throw new Error('sprintf: (minimum-)width must be finite')
    }
    if (!precision) {
      precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined
    } else if (precision == '*') {
      precision = +a[i++]
    } else if (precision.charAt(0) == '*') {
      precision = +a[precision.slice(1, -1)]
    } else {
      precision = +precision
    }
    // grab value using valueIndex if required?
    value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++]

    switch (type) {
      case 's':
        return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar)
      case 'c':
        // @ts-expect-error TS(2554): Expected 6 arguments, but got 5.
        return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
      case 'b':
        return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'o':
        return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'x':
        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'X':
        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase()
      case 'u':
        return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'i':
      case 'd':
        number = (+value) | 0
        prefix = number < 0 ? '-' : positivePrefix
        value = prefix + pad(String(Math.abs(number)), precision, '0', false)
        // @ts-expect-error TS(2554): Expected 6 arguments, but got 5.
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      case 'e':
      case 'E':
      case 'f':
      case 'F':
      case 'g':
      case 'G':
        number = +value
        prefix = number < 0 ? '-' : positivePrefix
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())]
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2]
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        value = prefix + Math.abs(number)[method](precision)
        // @ts-expect-error TS(2554): Expected 6 arguments, but got 5.
        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
      default:
        return substring
    }
  }

  return format.replace(regex, doFormat)
}

// necessaria
module.exports = sprintf
