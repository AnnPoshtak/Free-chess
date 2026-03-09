import styles from "./BoardLayout.module.scss";
import BoardControls from "./BoardControls/BoardControls";
import BoardMessage from "./BoardMessage/BoardMessage";
import React, { useState, useRef } from "react";
import moveSoundFile from "../../assets/sounds/move.mp3";
import { Chess, type Square } from "chess.js";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import MoveHistory from "./MoveHistory/MoveHistory";

// List of all piece types
const pieceTypes = [
  "wP", "wN", "wB", "wR", "wQ", "wK",
  "bP", "bN", "bB", "bR", "bQ", "bK",
] as const;

const BoardLayout = () => {
  // create a chess game using a ref to always have access to the latest game state within closures and maintain the game state across renders
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  // track the current position of the chess game in state to trigger a re-render of the chessboard
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  let getLocalStorage = JSON.parse(localStorage.getItem("chess-settings") || "{}");

  const colorsDark = {
    classic: { backgroundColor: "#976103ff" },
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
    chessGame.reset();
    setChessPosition(chessGame.fen());
    setGameOverMessage(null);
    setMoveFrom("");
    setOptionSquares({});
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

  // make a random "CPU" move
  function makeRandomMove() {
    // get all possible moves`
    const possibleMoves = chessGame.moves();
    // exit if the game is over
    if (chessGame.isGameOver() || possibleMoves.length === 0) {
      checkGameOver();
      return;
    }
    // pick a random move
    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    // make the move
    chessGame.move(randomMove);
    playMoveSound();
    // update the position state
    setChessPosition(chessGame.fen());
    checkGameOver();
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
      }
      // return early
      return;
    }
    // update the position state
    setChessPosition(chessGame.fen());
    // make random cpu move after a short delay
    setTimeout(makeRandomMove, 300);
    // clear moveFrom and optionSquares
    setMoveFrom("");
    setOptionSquares({});
  }

  // handle piece drop
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    // type narrow targetSquare potentially being null (e.g. if dropped off board)
    if (!targetSquare) {
      return false;
    }
    // try to make the move according to chess.js logic
    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });

      playMoveSound();
      // update the position state upon successful move to trigger a re-render of the chessboard
      setChessPosition(chessGame.fen());
      // clear moveFrom and optionSquares
      setMoveFrom("");
      setOptionSquares({});
      checkGameOver();
      if (!chessGame.isGameOver()) {
        // make random cpu move after a short delay
        setTimeout(makeRandomMove, 500);
      }
      // return true as the move was successful
      return true;
    } catch {
      // return false as the move was not successful
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

  const chessboardOptions = {
    onPieceDrop,
    onSquareClick,
    position: chessPosition,
    squareStyles: optionSquares,
    id: "click-or-drag-to-move",
    darkSquareStyle,
    lightSquareStyle,
    pieces: piecesProp,
  };

  const moveHistory = chessGame.history();
  const currentFen = chessGame.fen();
  const halfMovesClock = parseInt(currentFen.split(" ")[4], 10);
  const movesUntilDraw = Math.ceil((100 - halfMovesClock) / 2);


  // render the chessboard
  return (
    <section className={styles.boardLayout}>
      <div className={styles.boardLayout_pos}>
        <Chessboard options={chessboardOptions} />
        {gameOverMessage && (
          <BoardMessage message={gameOverMessage} onRestart={restartGame} />
        )}
      </div>
      {halfMovesClock > 0 && (
        <div style={{ textAlign: "center", margin: "10px 0", color: "#666" }}>
          До нічиєї (правило 50 ходів) залишилось: <strong>{movesUntilDraw}</strong>
        </div>
      )}
      <BoardControls restartGame={restartGame} />
      {getLocalStorage.showMoveHistory === true && (
        <MoveHistory moveHistory={moveHistory} />
      )}
    </section>
  );
};

export default BoardLayout;