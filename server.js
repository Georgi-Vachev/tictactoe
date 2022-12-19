const http = require('http');
const express = require('express');
const socketIO = require('socket.io');


const app = express();
app.use('/', express.static('static'));
const server = http.createServer(app);
const io = socketIO(server);

const rooms = {};

io.on('connect', socket => {
    console.log('Player connected');

    socket.on('selectRoom', roomId => {
        if (rooms[roomId] == undefined) {
            rooms[roomId] = new Map();
        }
        const players = rooms[roomId];

        if (players.size >= 2) {
            socket.emit('error', 'Room is full!');
            socket.disconnect();
        } else {
            socket.join(roomId);
            initGame(roomId, players, socket);
        }
    });
});

function initGame(roomId, players, socket) {
    socket.on('position', pos => {
        console.log('Position:', pos);
        io.to(roomId).emit('position', pos);
        io.to(roomId).emit('messagee', 'hello');
    })

    socket.on("chat message", (msg, sym) => {
        console.log(`Message from ${sym}:` + msg)
        io.to(roomId).emit('chat message', msg, sym)
    })

    socket.on('newGame', () => {
        console.log('New game initited');
        io.to(roomId).emit('newGame');
    });

    socket.on('disconnect', () => {
        console.log('Player left');
        players.delete(socket);
    });

    let symbol = 'X';
    if (players.size > 0) {
        const otherSymbol = [...players.values()][0];
        if (otherSymbol == 'X') {
            symbol = 'O';
        }
    }
    players.set(socket, symbol);
    console.log('Assigning symbol', symbol);
    socket.emit('symbol', symbol);

};

server.listen(3000, () => console.log('Server is listening on port 3000'));