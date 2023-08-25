"use strict";

const WebSocket = require("ws").Server;
const server = require("http").createServer();
const { app, loggedUsers } = require("./app.js");
const Game = require("./models/game");
const { Chess } = require("chess.js");
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
    checkIfUserIsInGame(user, socket);
    var game = currentGame(user);

    socket.on("message", (message) => {
        var data = JSON.parse(message);
        switch (data.type) {
            case "move":
                console.log("move");
                console.log(data.fen);
                game.chess.load(data.fen);
                console.log(game.chess._turn);
                //game.chess._turn = game.chess._turn == "w" ? "b" : "w";

                console.log(game.chess.isGameOver());
                game.chess.fen();
                if (game.chess.isGameOver()) {
                    console.log("game over");
                    game.player1socket.send(
                        JSON.stringify({
                            type: "gameOver",
                            chess: game.chess.fen(),
                            turn: game.chess._turn
                        })
                    );
                    game.player2socket.send(
                        JSON.stringify({
                            type: "gameOver",
                            chess: game.chess.fen(),
                            turn: game.chess._turn
                        })
                    );
                } else {
                    game.player1socket.send(
                        JSON.stringify({
                            type: "updateBoard",
                            chess: game.chess.fen(),
                            turn: game.chess._turn
                        })
                    );
                    game.player2socket.send(
                        JSON.stringify({
                            type: "updateBoard",
                            chess: game.chess.fen(),
                            turn: game.chess._turn
                        })
                    );
                }
                break;
        }
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

function currentGame(user) {
    let index = games.findIndex((game) => game.player1 == user || game.player2 == user);
    if (index == -1) return null;
    else return games[index];
}

function checkIfUserIsInGame(user, socket) {
    let index = games.findIndex((game) => game.player1 == user || game.player2 == user);
    //not in game add it to game
    if (index == -1) {
        addUserToGame(user, socket);
    } //already in game update socket and send board 
    else {
        if (games[index].player1 == user) {
            games[index].player1socket = socket;
            games[index].player1socket.send(JSON.stringify({
                type: "gameStart",
                color: "white",
                chess: games[index].chess.fen(),
                turn: games[index].chess._turn
            }));
        } else {
            games[index].player2socket = socket;
            games[index].player2socket.send(JSON.stringify({
                type: "gameStart",
                color: "black",
                chess: games[index].chess.fen(),
                turn: games[index].chess._turn
            }));
        }

    }
}

function addUserToGame(user, socket) {
    if (games.length == 0) {
        var chess = new Chess();
        console.log("flag");
        //console.log(chess.fen());
        var game = new Game({
            player1: user,
            player1socket: socket,
            player2: null,
            player2socket: null,
            chess: chess,
        });
        console.log(game.chess.fen());
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
                chess: chess,
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
                    chess: games[index].chess.fen()
                })
            );
            games[index].player2socket.send(
                JSON.stringify({
                    type: "gameStart",
                    color: "black",
                    chess: games[index].chess.fen()
                })
            );
            console.log(games);
        }
    }
}
