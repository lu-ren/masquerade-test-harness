var prompt = require('prompt'),
    io = require('socket.io-client'),
    fileExists = require('file-exists'),
    fs = require('fs');

var url = 'http://127.0.0.1:8080';
var options = {
    transports: ['websocket'],
    'force new connection': true
};

let client = io.connect(url, options);

let maleAccessToken = 'LurenAccessDev123';
let femaleAccessToken = 'AliceAccessDev123';

let maleSecretPath = 'male_secret.txt';
let femaleSecretPath = 'female_secret.txt';

let myUsername;
let myGender;
let myAccessToken;

if (process.argv.length == 3) {
    if (process.argv[2] == '--reset') {
        let secretPath;

        if (fileExists(maleSecretPath))
            secretPath = maleSecretPath;
        else if (fileExists(femaleSecretPath))
            secretPath = femaleSecretPath;
        else
            return console.log('No secret to destroy');

        fs.unlink(secretPath, (err) => {
            if (err)
                return console.log(err);
            console.log(secretPath + ' destroyed successfully');
        });
    }
}

prompt.start();

prompt.get(['gender'], (err, result) => {

    let user = {};
    let secretPath;

    if (result.gender == 'male') {
        secretPath = maleSecretPath;
        myUsername = 'Luren';
        myGender = 'male';
        myAccessToken = maleAccessToken;
    } else {
        secretPath = femaleSecretPath;
        myUsername = 'Alice';
        myGender = 'female';
        myAccessToken = femaleAccessToken;
    }

    if (fileExists(secretPath)) {
        console.log('Secret exists. Sending secret...');
        fs.readFile(secretPath, (err, data) => {
            if (err)
                throw err;
            user.secret = data.toString();
            client.emit('account.authenticate', user);
        });
    } else {
        console.log('Secret does not exist. Sending access token...');
        user.access_token = myAccessToken;
        client.emit('account.authenticate', user);
    }

});

client.on('account.authenticated', (message) => {
    console.log('Account authenticated');
    let newMessage = {
        lat: 38.88,
        lon: -77.17
    };
    client.emit('room.find', newMessage);
});

client.on('account.created', (message) => {
    fs.writeFile(secretPath, message, (err) => {
        if (err)
            return console.log(err);
        console.log('Secret ' + message + ' is saved to file ' + secretPath);
    });
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

            console.log(myUsername + ' - ' + message);
            client.emit('room.send', message);
            startChat();
        });
}
