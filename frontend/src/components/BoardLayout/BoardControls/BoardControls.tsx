import styles from "./BoardControls.module.scss";

const BoardControls = ({ restartGame }: any) => {
  return (
    <div className={styles.boardControls}>
      <button className={styles.boardControls_playBtn} onClick={restartGame}>
        Restart
      </button>
    </div>
  );
};

export default BoardControls;
