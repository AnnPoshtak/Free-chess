import styles from "./BoardLayout.module.scss";

const BoardLayout = () => {
  const squares = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;

      squares.push(
        <div
          key={`${row}-${col}`}
          className={`${styles.square} ${isLight ? styles.light : styles.dark}`}
        >
          {/* Пізніше тут буде рендеритися фігура*/}
        </div>,
      );
    }
  }

  return <div className={styles.board}>{squares}</div>;
};

export default BoardLayout;
