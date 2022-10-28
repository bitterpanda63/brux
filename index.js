let rooms = {  };

const dgram = require('dgram');
const udp = dgram.createSocket("udp4");
const ip = require('ip');
const CryptoJS = require("crypto-js");
class Room{
    constructor(room_name, key) {
        this.name = room_name;
        this.key = key;
        this.hasCallback = () => {
            return this.callback;
        }
    }
}

let broadcastIp = ip.address().split('.');
broadcastIp[broadcastIp.length - 1] = '255';
broadcastIp = ip.toString(Buffer.from(broadcastIp));

// Testing purposes only
broadcastIp = 'localhost'
udp.on('listening', () => {
    udp.setBroadcast(true);
});
udp.on('message', (msg, rinfo) => {
    let transmission = msg.toString();
    let room = transmission.split('§§§')[0];
    let cipher = transmission.split('§§§')[1];
    console.log(cipher)
    let decrypted_msg = CryptoJS.AES.decrypt(cipher, rooms[room].key).toString(CryptoJS.enc.Utf8);
    console.log(decrypted_msg)
});

const joinRoom = (room, options) => rooms[room] = new Room(room, options.key);

const send = (room_name, message) => {
    let room = rooms[room_name];
    let enc_msg = CryptoJS.AES.encrypt(message, room.key).toString();
    let buffer = Buffer.from(`${room_name}§§§${enc_msg}`);
    udp.send(buffer, 0, buffer.length, 8089, broadcastIp);
}
const onMessage = (room, callback_function) => {
    
}
module.exports = {
    joinRoom,
    send,
    onMessage
}
udp.bind(8089, () => {
    udp.setBroadcast(true)
});