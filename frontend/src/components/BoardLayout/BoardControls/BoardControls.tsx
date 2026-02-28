import styles from "./BoardControls.module.scss";

const BoardControls = () => {
  return (
    <div className={styles.boardControls}>
      <button className={styles.boardControls_playBtn}>Play</button>
    </div>
  );
};

export default BoardControls;
