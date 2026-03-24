import React from "react";
import style from "./GameModeModal.module.scss";

interface Props {
  onSelectMode: (mode: "bot" | "multiplayer") => void; 
}

const GameModeModal: React.FC<Props> = ({ onSelectMode }) => {
  return (
    <div className={style.overlay}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Оберіть режим гри</h2>
        
        <div className={style.buttonGroup}>
          <button 
            className={style.playButton} 
            onClick={() => onSelectMode("bot")}
          >
            З ботом
          </button>
          <button 
            className={style.playButton} 
            onClick={() => onSelectMode("multiplayer")}
          >
            З людиною по мережі
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeModal;