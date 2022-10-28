//let handle = os.hostname();

const {Room,Rooms} = require("./src/api/Room");
const {startUdp} = require("./src/udp/udpHandler");
const axios = require('axios').default;
const fs = require("fs");

let rooms = new Rooms();

startUdp(8045, rooms);

module.exports = {rooms, Room};

let newNetworkRoom = new Room("netroom-http-demo", "openaccess", rooms);

const BASE_URL = "https://github.com";

newNetworkRoom.on('data', (data) => {
    console.log(data.data)
    if(data.data.startsWith("request-get")) {
        const url = data.data.split("|\\|")[1];
        axios.get(BASE_URL + url, { responseType: 'arraybuffer', baseURL:BASE_URL })
            .then(data => {
                newNetworkRoom.stream.push(data.data)
                newNetworkRoom.send("stream_end")
            })
            .catch(err => {
                console.error(`Failed to retrieve ${url}` + (err.toString().includes("404") ? "404" : ""))
            })
    }
    if(data.data.startsWith("request-post")) {
        const url = data.data.split("|\\|")[1];
        const body = JSON.parse(data.data.split("|\\|")[2]);
        axios.post(BASE_URL + url, { responseType: 'arraybuffer', baseURL:BASE_URL, data:body  })
            .then(data => {
                newNetworkRoom.stream.push(data.data)
                newNetworkRoom.send("stream_end")
            })
            .catch(err => {
                console.error(`Failed to retrieve ${url}` + (err.toString().includes("404") ? "404" : ""))
            })
    }
});/*
//newNetworkRoom.send("I kissed a girl and I liked it oOooOoOoO");
const myReadStream = fs.createReadStream("sample.txt");
myReadStream.pipe(newNetworkRoom.stream);
newNetworkRoom.stream.pipe(fs.createWriteStream("sample_copy.txt", {flags: 'w'}));
*/
const app = require("express")();
const bodyParser = require('body-parser');
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

app.get('*', (req, res) => {
    newNetworkRoom.send("request-get|\\|" + req.url.substring(1));
    newNetworkRoom.stream.pipe(res);
    newNetworkRoom.on('data', data => {
        if(data.data.startsWith("stream_end")) {
            res.end();
        }
    })
})

app.post('*', (req, res) => {
    newNetworkRoom.send("request-post|\\|" + req.url.substring(1) + "|\\|" + JSON.stringify(req.body));
    newNetworkRoom.stream.pipe(res);
    newNetworkRoom.on('data', data => {
        if(data.data.startsWith("stream_end")) {
            res.end();
        }
    })
})


app.listen(8080);