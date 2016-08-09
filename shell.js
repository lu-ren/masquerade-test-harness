var prompt = require('prompt'),
    io = require('socket.io-client');

var url = 'http://127.0.0.1:8080';
var options = {
    transports: ['websocket'],
    'force new connection': true
};

let client = io.connect(url, options);

let maleUsers = [{
    name: 'Link',
    email: 'link@gmail.com',
    facebookID: 'alinktothepast',
    meta: {
        gender: 'Male'
    }
}];

let femaleUsers = [{
    name: 'Zelda',
    email: 'zelda@gmail.com',
    facebookID: 'zelda1238123',
    meta: {
        gender: 'Female'
    }
}];

prompt.start();

prompt.get(['gender'], (err, result) => {

    let user;

    if (result.gender === 'male') {
        user = maleUsers.pop();
    } else {
        user = femaleUsers.pop();
    }
    client.emit('account.authenticate', user);
});

client.on('account.authenticated', (message) => {
    console.log('Account authenticated');
    prompt.get(['lat', 'lon'], (err, result) => {
        let lat = result.lat;
        let lon = result.lon;
        
        let newMessage = {
            lat: lat,
            lon: lon
        }

        client.emit('room.find', newMessage);
    });
});

client.on('room.start', (message) => {
    console.log(message.email);
});
