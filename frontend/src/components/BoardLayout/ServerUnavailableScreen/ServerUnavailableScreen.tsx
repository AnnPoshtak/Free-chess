import { useState } from "react";
import BotGame from "../BotGame.tsx";
import style from "./ServerUnavailableScreen.module.scss";

export default function ServerUnavailableScreen() {
  const [playBot, setPlayBot] = useState(false);

  if (playBot) return <BotGame />;

  return (
    <div className={style.overlay}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.icon}>⚡</div>
        <h1 className={style.title}>Сервер не відповідає</h1>
        <p className={style.text}>
          Ой, сервер заснув 😴 Ми намагаємося його розбудити, але поки безуспішно 🙃 <br /> 
          Можна зачекати трохи або пограти з ботом, щоб не нудьгувати.
        </p>
        <button onClick={() => setPlayBot(true)}>Грати з ботом</button>
      </div>
    </div>
  );
}