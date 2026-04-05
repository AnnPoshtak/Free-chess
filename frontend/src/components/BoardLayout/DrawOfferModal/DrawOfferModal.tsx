import style from "../../NicknameModal/NicknameModal.module.scss";

interface DrawOfferModalProps {
    onAccept: () => void;
    onDecline: () => void;
}

const DrawOfferModal = ({ onAccept, onDecline }: DrawOfferModalProps) => {
    return (
        <div className={style.overlay}>
            <div className={style.modal} onClick={(e) => e.stopPropagation()}>
                <h2>Пропозиція нічиєї</h2>
                <p style={{ margin: "20px 0" }}>Ваш суперник запропонував зіграти внічию. Що оберете?</p>
                
                <div className={style.buttonGroup} style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button className={style.playButton} style={{ background: "#4caf50" }} onClick={onAccept}>
                        Прийняти
                    </button>
                    <button className={style.playButton} style={{ background: "#f44336" }} onClick={onDecline}>
                        Відхилити
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DrawOfferModal;