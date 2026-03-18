import React, { useState, useEffect } from 'react';
import styles from './Settings.module.scss';
import type { ChessSettings } from '../../common/interface/ChessSettings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: ChessSettings) => void; 
}

const default_settings: ChessSettings = {
  theme: 'light',
  soundEnabled: true,
  showAvailableMoves: true,
  showMoveHistory: true,
  boardStyle: 'classic',
  pieceStyle: 'Classic',
  difficulty: 'easy',
};

const Settings: React.FC<Props> = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<ChessSettings>(() => {
    try {
      const saved = localStorage.getItem('chess-settings');
      return saved ? JSON.parse(saved) : default_settings;
    } catch (error) {
      return default_settings;
    }
  });

  useEffect(() => {
    localStorage.setItem('chess-settings', JSON.stringify(settings));
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof ChessSettings>(key: K, value: ChessSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2>Налаштування ⚙️</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.settingRow}>
          <span>Тема сайту</span>
          <select 
            className={styles.styledSelect}
            value={settings.theme} 
            onChange={(e) => updateSetting('theme', e.target.value as ChessSettings['theme'])}
          >
            <option value="light">Світла</option>
            <option value="dark">Темна</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <span>Стиль дошки</span>
          <div className={styles.boardPresets}>
            <button 
              className={`${styles.presetBtn} ${styles.classic} ${settings.boardStyle === 'classic' ? styles.active : ''}`}
              onClick={() => updateSetting('boardStyle', 'classic')}
              title="Класична"
            />
            <button 
              className={`${styles.presetBtn} ${styles.green} ${settings.boardStyle === 'green' ? styles.active : ''}`}
              onClick={() => updateSetting('boardStyle', 'green')}
              title="Турнірна зелена"
            />
            <button 
              className={`${styles.presetBtn} ${styles.blue} ${settings.boardStyle === 'blue' ? styles.active : ''}`}
              onClick={() => updateSetting('boardStyle', 'blue')}
              title="Синя"
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <span>Стиль фігур</span>
          <select 
            className={styles.styledSelect}
            value={settings.pieceStyle}
            onChange={(e) => updateSetting('pieceStyle', e.target.value as ChessSettings['pieceStyle'])}
          >
            <option value="Classic">Класична</option>
            <option value="Kosal">Kosal</option>
            <option value="Pixel">Pixel</option>
            <option value="Riohacha">Riohacha</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <span>Складність бота</span>
          <select 
            className={styles.styledSelect}
            value={settings.difficulty}
            onChange={(e) => updateSetting('difficulty', e.target.value as ChessSettings['difficulty'])}
          >
            <option value="easy">Легкий</option>
            <option value="medium">Середній</option>
            <option value="hard">Важкий</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <span>Звук ходів</span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={settings.soundEnabled} 
              onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingRow}>
          <span>Показувати доступні ходи</span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={settings.showAvailableMoves} 
              onChange={(e) => updateSetting('showAvailableMoves', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingRow}>
          <span>Показувати історію ходів</span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={settings.showMoveHistory} 
              onChange={(e) => updateSetting('showMoveHistory', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

      </div>
    </div>
  );
};

export default Settings;