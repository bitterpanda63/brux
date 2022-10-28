let {Room} = require('./index');
let room = new Room('test-1', 'Password');

room.send('test', ['111', '222', '333', '444'])

room.actions.set('test', (sender, args) => {
    console.log(`${sender} Sent you : ${args.join(' ')}`)
});