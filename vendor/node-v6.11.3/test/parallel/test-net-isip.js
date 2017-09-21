'use strict';
require('../common');
const assert = require('assert');
const net = require('net');

assert.strictEqual(net.isIP('127.0.0.1'), 4);
assert.strictEqual(net.isIP('x127.0.0.1'), 0);
assert.strictEqual(net.isIP('example.com'), 0);
assert.strictEqual(net.isIP('0000:0000:0000:0000:0000:0000:0000:0000'), 6);
assert.strictEqual(net.isIP('0000:0000:0000:0000:0000:0000:0000:0000::0000'),
                   0);
assert.strictEqual(net.isIP('1050:0:0:0:5:600:300c:326b'), 6);
assert.strictEqual(net.isIP('2001:252:0:1::2008:6'), 6);
assert.strictEqual(net.isIP('2001:dead:beef:1::2008:6'), 6);
assert.strictEqual(net.isIP('2001::'), 6);
assert.strictEqual(net.isIP('2001:dead::'), 6);
assert.strictEqual(net.isIP('2001:dead:beef::'), 6);
assert.strictEqual(net.isIP('2001:dead:beef:1::'), 6);
assert.strictEqual(net.isIP('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'), 6);
assert.strictEqual(net.isIP(':2001:252:0:1::2008:6:'), 0);
assert.strictEqual(net.isIP(':2001:252:0:1::2008:6'), 0);
assert.strictEqual(net.isIP('2001:252:0:1::2008:6:'), 0);
assert.strictEqual(net.isIP('2001:252::1::2008:6'), 0);
assert.strictEqual(net.isIP('::2001:252:1:2008:6'), 6);
assert.strictEqual(net.isIP('::2001:252:1:1.1.1.1'), 6);
assert.strictEqual(net.isIP('::2001:252:1:255.255.255.255'), 6);
assert.strictEqual(net.isIP('::2001:252:1:255.255.255.255.76'), 0);
assert.strictEqual(net.isIP('::anything'), 0);
assert.strictEqual(net.isIP('::1'), 6);
assert.strictEqual(net.isIP('::'), 6);
assert.strictEqual(net.isIP('0000:0000:0000:0000:0000:0000:12345:0000'), 0);
assert.strictEqual(net.isIP('0'), 0);
assert.strictEqual(net.isIP(), 0);
assert.strictEqual(net.isIP(''), 0);
assert.strictEqual(net.isIP(null), 0);
assert.strictEqual(net.isIP(123), 0);
assert.strictEqual(net.isIP(true), 0);
assert.strictEqual(net.isIP({}), 0);
assert.strictEqual(net.isIP({ toString: () => '::2001:252:1:255.255.255.255' }),
                   6);
assert.strictEqual(net.isIP({ toString: () => '127.0.0.1' }), 4);
assert.strictEqual(net.isIP({ toString: () => 'bla' }), 0);

assert.strictEqual(net.isIPv4('127.0.0.1'), true);
assert.strictEqual(net.isIPv4('example.com'), false);
assert.strictEqual(net.isIPv4('2001:252:0:1::2008:6'), false);
assert.strictEqual(net.isIPv4(), false);
assert.strictEqual(net.isIPv4(''), false);
assert.strictEqual(net.isIPv4(null), false);
assert.strictEqual(net.isIPv4(123), false);
assert.strictEqual(net.isIPv4(true), false);
assert.strictEqual(net.isIPv4({}), false);
assert.strictEqual(net.isIPv4({
  toString: () => '::2001:252:1:255.255.255.255'
}), false);
assert.strictEqual(net.isIPv4({ toString: () => '127.0.0.1' }), true);
assert.strictEqual(net.isIPv4({ toString: () => 'bla' }), false);

assert.strictEqual(net.isIPv6('127.0.0.1'), false);
assert.strictEqual(net.isIPv6('example.com'), false);
assert.strictEqual(net.isIPv6('2001:252:0:1::2008:6'), true);
assert.strictEqual(net.isIPv6(), false);
assert.strictEqual(net.isIPv6(''), false);
assert.strictEqual(net.isIPv6(null), false);
assert.strictEqual(net.isIPv6(123), false);
assert.strictEqual(net.isIPv6(true), false);
assert.strictEqual(net.isIPv6({}), false);
assert.strictEqual(net.isIPv6({
  toString: () => '::2001:252:1:255.255.255.255'
}), true);
assert.strictEqual(net.isIPv6({ toString: () => '127.0.0.1' }), false);
assert.strictEqual(net.isIPv6({ toString: () => 'bla' }), false);
