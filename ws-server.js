'use strict';

const WebSocket = require('ws').Server;
const server = require('http').createServer();
const {app, loggedUsers} = require("./app.js");

const wss = new WebSocket({ server: server });

var res = server.on('request', app);
console.log(app);

wss.on('connection', (socket) => {
    console.log('Connection established');
    console.log(loggedUsers);
    console.log(res);
    socket.on('message', (message) => {
        console.log(`received: ${message}`);
    
        socket.send(JSON.stringify({
          answer: 42
        }));
    });
} );

server.listen(3001, () => {
    console.log('Listening on 3001' );
});