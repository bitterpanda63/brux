const CryptoJS = require("crypto-js");

const enc = (data, key) => {
   return CryptoJS.AES.encrypt(data, key).toString();
};
const dec = (data, key) => {
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}

module.exports = {enc, dec}