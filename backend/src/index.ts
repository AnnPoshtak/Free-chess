import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

type Player = {
  id: string;
  nickname: string;
};

let waitingForGame: Player[] = [];

const io = new Server(server, {
  cors: {
    origin: "https://annposhtak.github.io",
    methods: ["GET", "POST"]
  }
});

function startGame() {
  
  while (waitingForGame.length >= 2){
    const player1 = waitingForGame.shift();
    const player2 = waitingForGame.shift();
  
    const player1Id = player1?.id;
    const player2Id = player2?.id;
  
    if (player1Id && player2Id) {
      const room = "gameRoom_" + Date.now();
  
      io.sockets.sockets.get(player1Id)?.join(room);
      io.sockets.sockets.get(player2Id)?.join(room);
  
      io.to(player1Id).emit("game_started", { roomId: room, color: "w", opponentNickname: player2?.nickname });
      io.to(player2Id).emit("game_started", { roomId: room, color: "b", opponentNickname: player1?.nickname });
      
      console.log(`Game started in room: ${room}. ${player1?.nickname} vs ${player2?.nickname}`);
  }
  }
}

io.on('connection', (socket) => {
  const nickname = socket.handshake.auth.nickname || "Анонім"; 
  console.log(`New Player joined! ID:${socket.id} Nickname: ${nickname}`);
  
  waitingForGame.push({ id: socket.id, nickname });
  startGame();

  socket.on("find_new_game", (data) => {
    if (data && data.roomId) {
      socket.leave(data.roomId);
    }
    
    console.log(`Player ${socket.id} is looking for a new game.`);
    const isAlreadyWaiting = waitingForGame.some(player => player.id === socket.id);
    
    if (!isAlreadyWaiting) {
      waitingForGame.push({ id: socket.id, nickname }); 
    }
    startGame();
  });

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
    waitingForGame = waitingForGame.filter(player => player.id !== socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server works on port ${PORT}`);
});
