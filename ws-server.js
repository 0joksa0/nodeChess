"use strict";

const WebSocket = require("ws").Server;
const server = require("http").createServer();
const { app, loggedUsers } = require("./app.js");
const Game = require("./models/game");
const Chess = require("chessjs");
//const session = require('express-session');

const wss = new WebSocket({ server: server });

var res = server.on("request", app);
//console.log(app);

//array of Games
var games = new Array();

//web socket server
wss.on("connection", (socket, req) => {
    console.log("Connection established");
    var user = currentPlayer(req);
    checkIfUserIsInGame(user,socket);

    socket.on("message", (message) => {
        console.log(`received: ${message}`);

        socket.send(
            JSON.stringify({
                answer: 42,
            })
        );
    });
});

server.listen(3001, () => {
    console.log("Listening on 3001");
});

function currentPlayer(req) {
    for (var user of loggedUsers) {
        var string = req.headers.cookie;
        console.log(string);
        console.log(user.session.id);
        console.log(string.includes(user.session.id));
        if (string.includes(user.session.id)) return user;
    }
    return null;
}

function checkIfUserIsInGame(user, socket){
    let index = games.findIndex((game) => game.player1 == user || game.player2 == user);
    //not in game add it to game
    if(index == -1){
        addUserToGame(user,socket);
    } //already in game update socket and send board 
    else{
        if(games[index].player1 == user){
            games[index].player1socket = socket;
            games[index].player1socket.send(JSON.stringify({
                type: "gameStart",
                color: "white",
                board: games[index].board
            }));
        } else{
            games[index].player2socket = socket;
            games[index].player2socket.send(JSON.stringify({
                type: "gameStart",
                color: "black",
                board: games[index].board
            }));
        }
        
    }
}

function addUserToGame(user,socket){
    if (games.length == 0) {
        var chess = new Chess();
        var game = new Game({
            player1: user,
            player1socket: socket,
            player2: null,
            player2socket: null,
            board: chess,
        });
        //console.log(game);
        games.push(game);
    } else {
        let index = games.findIndex((game) => game.player2 == null);
        console.log(index);
        if (index == -1) {
            var chess = new Chess();
            var game = new Game({
                player1: user,
                player1socket: socket,
                player2: null,
                player2socket: null,
                board: chess,
            });
            //console.log(game);
            games.push(game);
        } else {
            games[index].player2 = user;
            games[index].player2socket = socket;
            games[index].player1socket.send(
                JSON.stringify({
                    type: "gameStart",
                    color: "white",
                    board: games[index].board,
                })
            );
            games[index].player2socket.send(
                JSON.stringify({
                    type: "gameStart",
                    color: "black",
                    board: games[index].board,
                })
            );
            console.log(games);
        }
    }
}
