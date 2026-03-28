import styles from "./BoardLayout.module.scss";
import BoardMessage from "./BoardMessage/BoardMessage";
import React, { useState, useRef, useEffect } from "react";
import moveSoundFile from "../../assets/sounds/move.mp3";
import { Chess, type Square } from "chess.js";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import { io } from "socket.io-client";
import NicknameModal from "../NicknameModal/NicknameModal.tsx";

// List of all piece types
const pieceTypes = [
  "wP", "wN", "wB", "wR", "wQ", "wK",
  "bP", "bN", "bB", "bR", "bQ", "bK",
] as const;

const socket = io("http://localhost:4000", {
  autoConnect: false,
});

const MultiplayerGame = () => {
  // create a chess game using a ref to always have access to the latest game state within closures and maintain the game state across renders
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  // track the current position of the chess game in state to trigger a re-render of the chessboard
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponentNickname, setOpponentNickname] = useState<string>("");
  
  const [nickname, setNickname] = useState<string | null>(null);

  //all for websockets
  useEffect(() => {
    if (!nickname) return;

    socket.auth = { nickname };

    socket.on("connect", () => {
      console.log("Connected to server. SocketID:", socket.id);
    });

    socket.on("game_started", (data) => {
      console.log("Received game_started!", data);
      setRoomId(data.roomId);
      setPlayerColor(data.color);
      setOpponentNickname(data.opponentNickname);
      
      chessGame.reset();
      setChessPosition(chessGame.fen());
      setGameOverMessage(null);
    });

    socket.on("board_updated", (newFen) => {
      console.log("Received new move!");
      chessGame.load(newFen);
      setChessPosition(newFen);
      playMoveSound();
      checkGameOver();
    });

    socket.on("opponent_disconnected", (data) => {
      setGameOverMessage("You win! Opponent left the game");
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("game_started");
      socket.off("board_updated");
      socket.off("opponent_disconnected");
      socket.disconnect(); // Disconnect to avoid phantom players
    };
  }, [nickname]);

  let getLocalStorage = JSON.parse(localStorage.getItem("chess-settings") || "{}");

  const colorsDark = {
    classic: { backgroundColor: "rgb(121, 85, 21)" },
    green: { backgroundColor: "#438205ff" },
    blue: { backgroundColor: "#205c88ff" },
  };
  const colorsLight = {
    classic: { backgroundColor: "#f0d9b5" },
    green: { backgroundColor: "#a5d68f" },
    blue: { backgroundColor: "#b8f5f5ff" },
  };

  const playMoveSound = () => {
    if (getLocalStorage) {
      try {
        if (getLocalStorage.soundEnabled === false) return;
      } catch (error) {
        console.error("Error reading settings:", error);
      }
    }
    const moveSound = new Audio(moveSoundFile);
    moveSound.play().catch(e => console.error(e));
  }
  
  function restartGame() {
    const oldRoomId = roomId;
    chessGame.reset();
    setChessPosition(chessGame.fen());
    setGameOverMessage(null);
    setMoveFrom("");
    setOptionSquares({});
    setRoomId(null);
    setPlayerColor(null);
    socket.emit("find_new_game", { roomId: oldRoomId });
  }

  function checkGameOver() {
    if (chessGame.isCheckmate()) {
      const winner = chessGame.turn() === "w" ? "Black" : "White";
      setGameOverMessage(`${winner} won!`);
    } else if (chessGame.isDraw()) {
      setGameOverMessage("Draw!");
    } else if (chessGame.isStalemate()) {
      setGameOverMessage("Stalemate! Draw");
    }
  }

  // get the move options for a square to show valid moves
  function getMoveOptions(square: Square) {
    // get the moves for the square
    const moves = chessGame.moves({
      square,
      verbose: true,
    });
    // if no moves, clear the option squares
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }
    // create a new object to store the option squares
    const newSquares: Record<string, React.CSSProperties> = {};
    // loop through the moves and set the option squares
    for (const move of moves) {
      newSquares[move.to] = {
        background:
          chessGame.get(move.to) &&
            chessGame.get(move.to)?.color !== chessGame.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)" // larger circle for capturing
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        // smaller circle for moving
        borderRadius: "50%",
      };
    }
    // set the square clicked to move from to yellow
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    // set the option squares
    if (getLocalStorage.showAvailableMoves === true) {
      setOptionSquares(newSquares);
    }
    // return true to indicate that there are move options
    return true;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (!playerColor || chessGame.turn() !== playerColor) return;

    // piece clicked to move
    if (!moveFrom && piece) {
      // get the move options for the square
      const hasMoveOptions = getMoveOptions(square as Square);
      // if move options, set the moveFrom to the square
      if (hasMoveOptions) {
        setMoveFrom(square);
      }
      // return early
      return;
    }
    // square clicked to move to, check if valid move
    const moves = chessGame.moves({
      square: moveFrom as Square,
      verbose: true,
    });
    const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);
    // not a valid move
    if (!foundMove) {
      // check if clicked on new piece
      const hasMoveOptions = getMoveOptions(square as Square);
      // if new piece, setMoveFrom, otherwise clear moveFrom
      setMoveFrom(hasMoveOptions ? square : "");
      // return early
      return;
    }
    // is normal move
    try {
      chessGame.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });
      playMoveSound();
    } catch {
      // if invalid, setMoveFrom and getMoveOptions
      const hasMoveOptions = getMoveOptions(square as Square);
      // if new piece, setMoveFrom, otherwise clear moveFrom
      if (hasMoveOptions) {
        setMoveFrom(square);
      return;
      }
    }

    setChessPosition(chessGame.fen());
    checkGameOver();
    setMoveFrom("");
    setOptionSquares({});
    if (roomId) {
      socket.emit("newFen", { roomId, fen: chessGame.fen() });
    }
  }

  // handle piece drop
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!playerColor || chessGame.turn() !== playerColor) return false;
    if (!targetSquare) return false;
    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      playMoveSound();
      setChessPosition(chessGame.fen());
      setMoveFrom("");
      setOptionSquares({});
      checkGameOver();
      if (roomId) {
        socket.emit("newFen", { roomId, fen: chessGame.fen() });
      }

      return true;
    } catch {
      return false;
    }
  }

  // Piece styles
  const selectedPieceStyle = getLocalStorage.pieceStyle || "Classic";

  let piecesProp: Record<string, (props: any) => JSX.Element> | undefined = undefined;

  if (selectedPieceStyle != "Classic") {
    piecesProp = {};
    pieceTypes.forEach((type) => {
      piecesProp![type] = ({ svgStyle, fill, square }) => (
        <svg
          viewBox="0 0 45 45"   //viewBox for react-chessboard
          width="100%"
          height="100%"
          style={svgStyle}
        >
          <image
            href={`/pieces/${selectedPieceStyle}/${type}.svg`}
            x="0"
            y="0"
            width="45"
            height="45"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      );
    });
  }

  // set the chessboard options
  const boardColor = getLocalStorage.boardStyle || "classic";
  const darkSquareStyle = colorsDark[boardColor as keyof typeof colorsDark];
  const lightSquareStyle = colorsLight[boardColor as keyof typeof colorsLight];

  // copy old square options
  const customSquareStyles = { ...optionSquares };

  // check if king have check or mate
  if (chessGame.isCheck() || chessGame.isCheckmate()) {
    const turn = chessGame.turn(); // who is moving now
    const board = chessGame.board();
    let kingSquare = "";
    for (const row of board) {
      for (const piece of row) {
        if (piece && piece.type === "k" && piece.color === turn) {
          kingSquare = piece.square;
          break; 
        }
      }
    }

    // make square red so player see danger
    if (kingSquare) {
      customSquareStyles[kingSquare] = {
        ...customSquareStyles[kingSquare], // keep old style if exist
        background: "radial-gradient(ellipse at center, rgba(255, 0, 0, 0.8) 0%, rgba(255, 0, 0, 0.4) 60%, transparent 100%)",
        borderRadius: "50%",
      };
    }
  }

  const chessboardOptions = {
    onPieceDrop,
    onSquareClick,
    position: chessPosition,
    squareStyles: customSquareStyles,
    id: "click-or-drag-to-move",
    darkSquareStyle,
    lightSquareStyle,
    pieces: piecesProp,
    boardOrientation: playerColor === "b" ? "black" : "white",
  };

  const moveHistory = chessGame.history();
  const currentFen = chessGame.fen();
  const halfMovesClock = parseInt(currentFen.split(" ")[4], 10);
  const movesUntilDraw = Math.ceil((100 - halfMovesClock) / 2);

  if (!nickname) {
    return <NicknameModal onSave={setNickname} />;
  }

  // render the chessboard
  return (
    <section className={styles.boardLayout}>
      <h2>{opponentNickname || "Очікуємо суперника..."}</h2>
      {/* Show waiting screen if no room exists yet */}
      {!roomId ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <h2>Шукаємо вам суперника... ⏳</h2>
          <p>Прийдеться зачекати деякий час...</p>
        </div>
      ) : (
        <>
          <div className={styles.boardLayout_pos}>
            <Chessboard options={chessboardOptions} />
            {gameOverMessage && (
              <BoardMessage message={gameOverMessage} onRestart={restartGame} />
            )}
          </div>
          {halfMovesClock > 0 && (
            <div style={{ textAlign: "center", margin: "10px 0", color: "#666" }}>
              Moves until draw (50-move rule): <strong>{movesUntilDraw}</strong>
            </div>
          )}
          {getLocalStorage.showMoveHistory === true && (
            <p style={{backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '12px 16px', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', margin: '20px auto', maxWidth: 'fit-content', textAlign: 'center'}}>Історія гри поки не доступна в мультиплеєрі. Ми працюємо над цим 🚧</p>
          )}
        </>
      )}
      <h2>{nickname}</h2>
    </section>
  );
};

export default MultiplayerGame;