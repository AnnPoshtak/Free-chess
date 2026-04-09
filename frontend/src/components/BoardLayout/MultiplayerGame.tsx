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
import ServerUnavailableScreen from "./ServerUnavailableScreen/ServerUnavailableScreen.tsx";
import Chat from "./Chat/Chat";
import DrawOfferModal from "./DrawOfferModal/DrawOfferModal.tsx";
import DrawDeclinedModal from "./DrawDeclinedModal/DrawDeclinedModal.tsx";

// List of all piece types
const pieceTypes = [
  "wP", "wN", "wB", "wR", "wQ", "wK",
  "bP", "bN", "bB", "bR", "bQ", "bK",
] as const;

const socket = io("http://localhost:4001", {
  autoConnect: false,
  transports: ["websocket"],
  extraHeaders: {
    "Bypass-Tunnel-Reminder": "true"
  }
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
  
  const [serverStatus, setServerStatus] = useState<boolean>(true)
  const [nickname, setNickname] = useState<string | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const [showDrawOffer, setShowDrawOffer] = useState<boolean>(false);
  const [showDrawDeclined, setShowDrawDeclined] = useState<boolean>(false);

  const roomIdRef = useRef(roomId);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  //all for websockets
  useEffect(() => {
    if (!nickname) return;

    socket.auth = { nickname };

    socket.on("connect", () => {
      console.log("Connected to server. SocketID:", socket.id);
      setServerStatus(true)
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

    setTimeout(() => {
      if (!socket.connected) {
        setServerStatus(false)
        socket.off("connect");
        socket.off("game_started");
        socket.off("board_updated");
        socket.off("opponent_disconnected");
        socket.off("opponent_offered_draw");
        socket.off("game_drawn");
        socket.off("opponent_declined_draw");
        socket.off("opponent_gave_up");
        socket.off("connect_error")
        socket.disconnect(); 
        }
    }, 65000)

    socket.on("opponent_disconnected", () => {
      setGameOverMessage("Ти переміг! Ваш противник покинув гру");
    });

    socket.on("opponent_gave_up", () => {
      setGameOverMessage("Ти переміг! Ваш противник здався");
    });

    socket.on("opponent_offered_draw", () => {
      setShowDrawOffer(true);
    });

    socket.on("game_drawn", () => {
      setGameOverMessage("Гра закінчилась внічию.");
    });

    socket.on("opponent_declined_draw", () => {
      setShowDrawDeclined(true);
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("game_started");
      socket.off("board_updated");
      socket.off("opponent_disconnected");
      socket.off("opponent_gave_up");
      socket.off("opponent_offered_draw");
      socket.off("game_drawn");
      socket.off("opponent_declined_draw");
      socket.off("connect_error");
      socket.disconnect(); 
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
    setIsChatOpen(false);
    socket.emit("find_new_game", { roomId: oldRoomId });
  }

  function checkGameOver() {
    if (chessGame.isCheckmate()) {
      const winner = chessGame.turn() === "w" ? "Чорні" : "Білі";
      setGameOverMessage(`${winner} перемогли!`);
    } else if (chessGame.isDraw()) {
      setGameOverMessage("Нічія!");
    } else if (chessGame.isStalemate()) {
      setGameOverMessage("Пат! Нічія");
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
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)" 
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        
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

  const selectedPieceStyle = getLocalStorage.pieceStyle || "Classic";

  let piecesProp: Record<string, (props: any) => React.JSX.Element> | undefined = undefined;

  if (selectedPieceStyle != "Classic") {
    piecesProp = {};
    pieceTypes.forEach((type) => {
      piecesProp![type] = ({ svgStyle }) => (
        <svg
          viewBox="0 0 45 45"   
          width="100%"
          height="100%"
          style={svgStyle}
        >
          <image
            href={`${import.meta.env.BASE_URL}/pieces/${selectedPieceStyle}/${type}.svg`}
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
    const turn = chessGame.turn(); 
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
        ...customSquareStyles[kingSquare], 
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
    boardOrientation: (playerColor === "b" ? "black" : "white") as "black" | "white",
  };

  const currentFen = chessGame.fen();
  const halfMovesClock = parseInt(currentFen.split(" ")[4], 10);
  const movesUntilDraw = Math.ceil((100 - halfMovesClock) / 2);

  const handleAcceptDraw = () => {
    setGameOverMessage("Гра закінчилась внічию за згодою обох гравців.");
    socket.emit("offer_draw_response", { roomId: roomIdRef.current, accepted: true });
    setShowDrawOffer(false);
  };

  const handleDeclineDraw = () => {
    socket.emit("offer_draw_response", { roomId: roomIdRef.current, accepted: false });
    setShowDrawOffer(false);
  };

  if (!nickname) {
    return <NicknameModal onSave={setNickname} />;
  }

  if (!serverStatus){
    return (<ServerUnavailableScreen/>)
  }

  // render the chessboard
  return (
    <section className={styles.boardLayout}>
      <h2>{opponentNickname || "Очікуємо суперника..."}</h2>
      {!roomId ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <h2>Шукаємо вам суперника... ⏳</h2>
          <p>Прийдеться зачекати деякий час...</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
            <div className={styles.boardLayout_pos}>
              <Chessboard options={chessboardOptions} />
              {gameOverMessage && (
                <BoardMessage message={gameOverMessage} onRestart={restartGame} />
              )}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                style={{
                  fontSize: "24px",
                  background: "#f0f0f0",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "50%",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50px",
                  height: "50px",
                  transition: "background 0.3s"
                }}
                title={isChatOpen ? "Закрити чат" : "Відкрити чат"}
              >
                💬
              </button>
              
              {isChatOpen && <Chat socket={socket} roomId={roomId} />}
            </div>
          </div>
          
          {halfMovesClock > 0 && (
            <div style={{ textAlign: "center", margin: "10px 0", color: "#666" }}>
              До нічиєї (правило 50 ходів) залишилось: <strong>{movesUntilDraw}</strong>
            </div>
          )}
          {getLocalStorage.showMoveHistory === true && (
            <p style={{backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '12px 16px', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', margin: '20px auto', maxWidth: 'fit-content', textAlign: 'center'}}>Історія гри поки не доступна в мультиплеєрі. Ми працюємо над цим 🚧</p>
          )}
        </>
      )}
      <h2>{nickname}</h2>
      <div style={{"display": "flex", "flexDirection":"row"}}>
        <button style={{"border": "1px solid #000000"}} onClick={() => {
          socket.emit("give_up", { roomId });
          setGameOverMessage("Ви здалися. Гра закінчена.");
        }}>Здатися</button>
        <button style={{"border": "1px solid #000000"}} onClick={() => socket.emit("offer_draw", { roomId })}>Запропонувати нічию</button>
      </div>

      {showDrawOffer && (
        <DrawOfferModal 
            onAccept={handleAcceptDraw} 
            onDecline={handleDeclineDraw} 
        />
      )}

      {showDrawDeclined && (
        <DrawDeclinedModal 
            onClose={() => setShowDrawDeclined(false)} 
        />
      )}
    </section>
  );
};

export default MultiplayerGame;