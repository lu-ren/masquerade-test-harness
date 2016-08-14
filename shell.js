var prompt = require('prompt'),
    io = require('socket.io-client');

var url = 'http://127.0.0.1:8080';
var options = {
    transports: ['websocket'],
    'force new connection': true
};

let client = io.connect(url, options);

let maleUser = {
    access_token: 'LurenAccessDev123'
};

let femaleUser = {
    access_token: 'AliceAccessDev123'
};

prompt.start();

prompt.get(['gender'], (err, result) => {

    let user;

    if (result.gender === 'male') {
        user = maleUser;
    } else {
        user = femaleUser;
    }
    client.emit('account.authenticate', user);
});

client.on('account.authenticated', (message) => {
    console.log('Account authenticated');
    let newMessage = {
        lat: me.loc.lat,
        lon: me.loc.lon
    };
    client.emit('room.find', newMessage);
});

client.on('account.created', (message) => {
    console.log('Secret: ' + message);
});

client.on('error.notify', (message) => {
    console.log(message);
});

client.on('room.start', (message) => {
    console.log(message.email);
    startChat();
});

client.on('room.message', (message) => {
    console.log(message.user.email + ' - ' + message.message);
});

client.on('room.leave', () => {
    console.log('Chat closed :[');
    process.exit();
});

var startChat = () => {
        prompt.get(['chat'], (err, result) => {
            let message = result.chat;

            console.log(me.email + ' - ' + message);
            client.emit('room.send', message);
            startChat();
        });
}
