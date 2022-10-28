const bruxProtoPacket = bruxData => {
    // TODO
    console.debug("Received a Brux Proto packet : ")
    console.debug(bruxData);
}
const requestResend = (checksum, room) => {
    // TODO
    console.log("Resend requested of message with checksum ", checksum);
}
module.exports = { bruxProtoPacket, bruxProtoOptions: {
    requestResend
}};