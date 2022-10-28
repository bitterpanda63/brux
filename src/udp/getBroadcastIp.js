const ip = require("ip");
let broadcastIp = ip.address().split('.');
broadcastIp[broadcastIp.length - 1] = '255';
broadcastIp = ip.toString(Buffer.from(broadcastIp));

module.exports = broadcastIp;