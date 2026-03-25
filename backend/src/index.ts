import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

let waitingForGame: string[] = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

function startGame() {
  if (waitingForGame.length < 2) return;

  const player1Id = waitingForGame.shift();
  const player2Id = waitingForGame.shift();

  if (player1Id && player2Id) {
    const room = "gameRoom_" + Date.now();

    io.sockets.sockets.get(player1Id)?.join(room);
    io.sockets.sockets.get(player2Id)?.join(room);

    io.to(player1Id).emit("game_started", { roomId: room, color: "w" });
    io.to(player2Id).emit("game_started", { roomId: room, color: "b" });
    
    console.log(`Game started in room: ${room}`);
  }
}

io.on('connection', (socket) => {
  console.log('New Player joined! ID:', socket.id);
  waitingForGame.push(socket.id);
  startGame();

  socket.on("newFen", (data) => {
    console.log(`Received move in room ${data.roomId}`);
    socket.to(data.roomId).emit("board_updated", data.fen);
  });

  socket.on("disconnecting", () => {
  console.log(`The player with id ${socket.id} has left the game.`);
  for (const room of socket.rooms) {
    if (room !== socket.id) {
      socket.to(room).emit("opponent_disconnected");
    }
  }
});

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    waitingForGame = waitingForGame.filter(id => id !== socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server works on port ${PORT}`);
});