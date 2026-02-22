import style from "./Header.module.scss"

const Header= () => {
    const settingsButtonClick = () => {
        alert("Later, the settings menu will open");
    }
    return (
        <>
            <header className={style.appHeader}>
                <div className={style.logo}>
                    <h1>Free-chess♟</h1>
                </div>

                <button className={style.settingsBtn} onClick={settingsButtonClick}>⚙</button>
            </header>
        </>
    )
}

export default Header;