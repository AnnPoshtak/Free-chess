import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
// allow requests from frontend
app.use(cors());

const server = http.createServer(app);

let waitingForGame: string[] = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", //frontend link
    methods: ["GET", "POST"]
  }
});

// function to start a game if we have 2 players
function startGame() {
  if (waitingForGame.length < 2) return;

  const player1Id = waitingForGame.shift();
  const player2Id = waitingForGame.shift();

  if (player1Id && player2Id) {
    // create unique room
    const room = "gameRoom_" + Date.now();

    // find real players by their IDs and put them in the room
  io.sockets.sockets.get(player1Id)?.join(room);
  io.sockets.sockets.get(player2Id)?.join(room);

    // tell players in this room that game started
    io.to(room).emit("game_started", { roomId: room });
    console.log(`Game started in room: ${room}`);
  }
}

// when new player opens the site
io.on('connection', (socket) => {
  console.log('New Player joined! ID:', socket.id);
  waitingForGame.push(socket.id);
  startGame();

  // when player leaves the site
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    waitingForGame = waitingForGame.filter(id => id !== socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server works on port ${PORT} 🚀`);
});