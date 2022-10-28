const cache = require('memory-cache');

const cacheSet = bruxString => {
    const checksum = bruxString.split(":")[3];
    cache.put(checksum, bruxString, 20_000);
}

module.exports = {set: cacheSet, get:cache.get}