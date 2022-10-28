const DOWNLOAD_FILES = false;
const {Room, rooms} = require("./index");
const path = require("path");
const fs = require("fs");

const ftRoom = new Room("filetransfer", "ft1234", rooms);

const sendFile = (filePath) => {
    console.log("Sending file...")
    ftRoom.send("incoming-file|" + path.basename(filePath))
    fs.createReadStream(filePath).pipe(ftRoom.stream);
    ftRoom.send("end-stream")
    console.log("Finished sending file.")
}

let openFileWrite
ftRoom.on("data", data => {
    if(!DOWNLOAD_FILES) { return }
    if(data.data.startsWith("incoming-file|")) {
        const filename = data.data.split("|")[1];
        openFileWrite = fs.createWriteStream(path.join(__dirname, "Downloads") + "/" + filename);
        ftRoom.stream.pipe(openFileWrite);
    }
    if(data.data.startsWith("end-stream")) {
        openFileWrite = undefined;
    }
});

sendFile("./sample.txt")