import style from "./MoveHistory.module.scss";

function MoveHistory({ moveHistory }) {
  return (
    <div>
      <h2>Історія ходів</h2>
      <ul className={style.moveHistory}>
        {moveHistory.map((move, index) => (
          <li key={index}>{move}</li>
        ))}
      </ul>
    </div>
  );
}

export default MoveHistory;