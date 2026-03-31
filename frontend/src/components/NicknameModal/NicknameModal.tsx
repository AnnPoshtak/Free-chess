import { useState, type KeyboardEvent } from "react";
import style from "./NicknameModal.module.scss";

interface NicknameModalProps {
    onSave: (nickname: string) => void;
}

const NicknameModal = ({ onSave }: NicknameModalProps) => {
    const [nickname, setNickname] = useState<string>("");

    const handleSave = () => {
        const trimmedNickname = nickname.trim();
        onSave(trimmedNickname);
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSave();
        }
    };

    return (
        <div className={style.overlay}>
            <div className={style.modal} onClick={(e) => e.stopPropagation()}>
                <h2>Введіть свій нікнейм</h2>
                
                <input 
                    type="text" 
                    value={nickname}
                    placeholder="Ваш нікнейм..."
                    onChange={(e) => {
                        setNickname(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    className={style.inputField}
                />
                <div className={style.buttonGroup}>
                    <button className={style.playButton} onClick={handleSave}>
                        Зберегти та Почати гру
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NicknameModal;