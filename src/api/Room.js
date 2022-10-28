const CHUNK_SIZE = 1000;

const EventEmitter = require("events");
const Stream = require("stream");
const proto = require("../proto/proto");
const cache = require("./cache");
const {send:udpSend} = require("./../udp/udpHandler");

class Room {
    roomName;
    key;
    roomEvents = new EventEmitter();

    send(data) {
        const bruxString = proto.create(this.roomName, data, true, this.key);
        cache.set(bruxString);
        udpSend(bruxString);
    }
    requestResend(checksum) {
        proto.bruxProtoOptions.requestResend(checksum, this);
    }
    resend(checksum) {
        udpSend(cache.get(checksum))
    }

    on(event, callback) { 
        this.roomEvents.on(event, callback)
    }
    streamChunks(chunk) {
        if(chunk.length > CHUNK_SIZE) {
            this.send("stream//" + chunk.subarray(0,CHUNK_SIZE).toString());
            this.streamChunks(chunk.subarray(CHUNK_SIZE, chunk.length))
        }
        else {
            this.send("stream//" + chunk.toString());
        }
    }
    setupStreams() {
        this.stream = new Stream.Duplex();
        this.roomEvents.on("data", (bruxData) => {
            if(bruxData.data.startsWith("stream//")) {
                console.log("Received some stream data : ");
                const streamData = bruxData.data.substring(8);
                console.log(streamData)
                this.stream.push(streamData);
            }
        })
        this.stream._write = (chunk, encoding, next) => {
            this.streamChunks(chunk)
            next();
        }
        this.stream._read = (size) => {}
    }

    constructor(roomName, key, rooms) { 
        this.roomName = roomName;
        this.key = key;
        rooms.rooms.set(this.roomName, this);

        this.setupStreams()
    }
}
class Rooms {
    constructor() {
        this.rooms = new Map();
    };
    getRoomFromRawMessage(rawMessage) {
        return rawMessage.split(":")[1];
    }
    handle(rawMessage) {
        const roomName = this.getRoomFromRawMessage(rawMessage);
        if(!this.rooms.has(roomName)) { return }
        const room = this.rooms.get(roomName);

        const bruxData = proto.parse(rawMessage, room.key);

        if(!bruxData.checksumValid) {
            room.requestResend(bruxData.checksum); return
        }
        if(!bruxData.isApplicationData) {
            proto.bruxProtoPacket(bruxData, room); return
        }

        room.roomEvents.emit('data', bruxData);
    }
}

module.exports = {Room, Rooms}