import React from "react";
import style from "./MoveHistory.module.scss";
interface MoveHistoryProps {
  moveHistory: string[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moveHistory }) => {
  return (
    <div className={style.historyContainer}>
      <h2>Історія ходів</h2>
      <ul className={style.moveHistory}>
        {moveHistory.map((move, index) => (
          <li key={index}>{move}</li>
        ))}
      </ul>
    </div>
  );
};

export default MoveHistory;
