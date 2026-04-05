import style from "../../NicknameModal/NicknameModal.module.scss";

interface DrawDeclinedModalProps {
    onClose: () => void;
}

const DrawDeclinedModal = ({ onClose }: DrawDeclinedModalProps) => {
    return (
        <div className={style.overlay}>
            <div className={style.modal} onClick={(e) => e.stopPropagation()}>
                <h2>Нічию відхилено</h2>
                <p style={{ margin: "20px 0" }}>Ваш суперник відхилив пропозицію нічиєї. Гра продовжується!</p>
                
                <div className={style.buttonGroup}>
                    <button className={style.playButton} onClick={onClose}>
                        Зрозуміло
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DrawDeclinedModal;