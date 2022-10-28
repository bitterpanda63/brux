const dgram = require("dgram");
const udp = dgram.createSocket("udp4");
const proto = require("../proto/proto");

let port;
const startUdp = (Port, rooms) => {
    port = Port;
    udp.bind(port);
    udp.on('listening', () => {
        console.log('Brux (UDP) is listening on port : ', port)
        udp.setBroadcast(true);
    });
    udp.on("message", (msg, rinfo) => {
        rooms.handle(msg.toString());
    })

}
const send = data => {
    udp.send(Buffer.from(data), port, require("./getBroadcastIp"), err => {
        if(err) console.error(err);
    })
}
module.exports = {startUdp,send}