import styles from "./BoardControls.module.scss";

const BoardControls = ({ restartGame }) => {
  return (
    <div className={styles.boardControls}>
      <button className={styles.boardControls_playBtn} onClick={restartGame}>Play</button>
    </div>
  );
};

export default BoardControls;
