const fs = require('fs')
const dgram = require('dgram');
const udp = dgram.createSocket("udp4");
const ip = require('ip');
const CryptoJS = require("crypto-js");
const os = require('os')

let rooms = new Map();

let broadcastIp = ip.address().split('.');
broadcastIp[broadcastIp.length - 1] = '255';
broadcastIp = ip.toString(Buffer.from(broadcastIp));

let handle = os.hostname();

class Room {
    name;
    encryption_key;
    active = true;
    actions = new Map();
    broadcastIp = broadcastIp;
    constructor(name, enc_key) { 
        this.name = name;
        this.encryption_key = enc_key;
        rooms.set(this.name, this)
    }
    send(action, args) {
        let to_encrypt = `${action}##${args.join('##')}`;
        // Encrypt
        let encrypted = CryptoJS.AES.encrypt(to_encrypt, this.encryption_key).toString();
        if(!this.active) {throw new Error('This room is inactive.'); return false;}
        let buffer = Buffer.from(`brux://${handle}@${this.name}||${encrypted}`);
        udp.send(buffer, 0, buffer.length, 8085, this.broadcastIp);
    }
}
udp.bind(8085);
udp.on('listening', () => {
    console.log('Listening')
    udp.setBroadcast(true);
});

udp.on('message', (msg, rinfo) => {
    if(rinfo.address === ip.address()) {return false;}
    let transmission = msg.toString();
    if(!transmission.startsWith('brux://')) {return false;}
    transmission = transmission.substring(7, transmission.length); // Remove brux://
    let transmission_split  = transmission.split('||');
    let transmission_sender = transmission_split[0].split('@')[0];
    let transmission_room   = transmission_split[0].split('@')[1];
    let transmission_cipher = transmission_split[1];

    if(!rooms.has(transmission_room)) {return false;}
    let room = rooms.get(transmission_room);
    let decrypted_msg = CryptoJS.AES.decrypt(transmission_cipher, room.encryption_key).toString(CryptoJS.enc.Utf8);

    let args = decrypted_msg.split('##');
    let action = args.shift();
    if(room.actions.has(action)) {
        room.actions.get(action)(transmission_sender, args)
    }

});

module.exports = {Room, handle}
