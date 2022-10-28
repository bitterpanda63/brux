# **Specifications for the BRUX Inter-service-communications protocol v2**

This is a document regarding the new specifications of the Brux protocol. Let’s first start with

## What is the goal of Brux?

The goal of brux is to make communication between services more simple and to provide network rooms for things such as errors, logs, status updates and whatever you can think of. It can also be used to send messages between people on a local network. Every room is encrypted with a key. Once in a room the system exists of actions which you can send arguments to.

## Please give an example

Say you have 8 devices on the network. 6 of them are servers and 2 of them are clients. The servers send logs to the network room `server-logs` and the errors to `server-errors`. In these network rooms there is the action `report` The server calls this action together with 2 arguments : The timestamp and the actual log or error. A client can then set a listener for `report` and receive the data of all these 6 servers. But the client can also call an action on the server (E.g.: `restart`) in which case the client becomes the server and the server the client. This can also be done in one network room E.g.: `servers` with the actions (`report-error`, `report-log`, `restart-server`). The unique identifier of a device using this protocol is also send along with the command. So clients and servers can select a partial audience if necessary.

## Which technologies does it use.

The protocol has to send packets to the broadcast ip, therefore it uses UDP. But it might switch to another Protocol in the future when newer protocols become mainstream and UDP obsolete for this protocol’s use-case.

## The specification of brux v2

A brux message consist of:

* The protocol name (`brux://`)
* A header which contains from which device it came and the name of a room
* A body which is encrypted by the room's key, this contains the command and the arguments for this command.

A package can look like this : 

`brux://device_name@room_name||ENCRYPTED-CONTENT`

With ENCRYPTED-CONTENT being `action_name##arg1##arg2##arg3`

Now we have the messages,

Then every Brux client should have the room `discovery` with the actions `list_rooms` and `get_room_info` this room is a public room that is used to give clients information about a room, usually just a short description. It is optional to make your room public and visible to all devices supporting brux on the network.

## Test script : 
```js
let {Room} = require('brux2');
let room = new Room('test-1', 'Password');

room.send('test', ['111', '222', '333', '444'])

room.actions.set('test', (sender, args) => {
    console.log(`${sender} Sended you : ${args.join(' ')}`)
});

```