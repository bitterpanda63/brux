const {enc:Encrypt, dec:Decrypt} = require("./encryption");
const {bruxProtoPacket, bruxProtoOptions} = require("./bruxProtoPacket");
const checksum = require("checksum");

const parse = (bruxString, key) => {
    let isApplicationData;
    if(bruxString.startsWith("brx:")) { isApplicationData = true }
    else if(bruxString.startsWith("brx-proto:")) { isApplicationData = false}
    else { return }

    const roomName = bruxString.split(":")[1];
    const encryptedData = bruxString.split(":")[2];
    const msgChecksum = bruxString.split(":")[3];

    const decryptedData = Decrypt(encryptedData, key);
    const checksumValid = msgChecksum == checksum(decryptedData);

    return {
        room: roomName,
        isApplicationData,
        checksumValid,
        cheksum:msgChecksum,
        data: decryptedData
    }
}

const create = (room, data, isApplicationData, key) => {
    let bruxString = (isApplicationData ? "brx:" : "brx-proto:") + room + ":" + Encrypt(data, key);
    bruxString += ":" + checksum(data);

    return bruxString;
}

module.exports = {parse, create, bruxProtoPacket, bruxProtoOptions}