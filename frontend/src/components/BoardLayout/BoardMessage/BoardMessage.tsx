import styles from "./BoardMessage.module.scss";

interface BoardMessageProps {
  message: string;
  onRestart: () => void;
}

const BoardMessage = ({ message, onRestart }: BoardMessageProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{message}</h2>
        <button className={styles.button} onClick={onRestart}>
          Зіграти знову
        </button>
      </div>
    </div>
  );
};

export default BoardMessage;
