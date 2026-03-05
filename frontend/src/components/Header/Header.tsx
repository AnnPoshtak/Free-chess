import React from 'react';
import style from './Header.module.scss';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className={style.appHeader}>
      <h1>Free-chess ♟️</h1>
      <button 
        className={style.settingsButton} 
        onClick={onOpenSettings}
        title="Налаштування"
      >
        ⚙️
      </button>
    </header>
  );
};

export default Header;