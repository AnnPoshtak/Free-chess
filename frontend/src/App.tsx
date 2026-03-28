import "./App.css";
import BotGame from "./components/BoardLayout/BotGame.tsx";
import MultiplayerGame from "./components/BoardLayout/MultiplayerGame.tsx"
import Header from "./components/Header/Header";
import { Container } from "./components/Container/Container";
import React, { useState, useEffect } from 'react';
import Settings from './components/Settings/Setings.tsx';
import type { ChessSettings } from './common/interface/ChessSettings.tsx';
import GameModeModal from "./components/GameModeModal/GameModeModal"; 

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<ChessSettings | null>(null);
  const [gameMode, setGameMode] = useState<"bot" | "multiplayer" | null>(null);
  useEffect(() => {
    if (appSettings?.theme) {
      document.body.setAttribute('data-theme', appSettings.theme);
    }
  }, [appSettings?.theme]);

  const handleSelectMode = (mode: "bot" | "multiplayer") => {
    setGameMode(mode);
  };

  return (
    <Container>
      {!gameMode && <GameModeModal onSelectMode={handleSelectMode} />}

      <Header onOpenSettings={() => setIsModalOpen(true)} />
      
      {gameMode === "bot" && (
        <BotGame />
      )}
      {gameMode === "multiplayer" && (
        <MultiplayerGame />
      )}
      <Settings 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSettingsChange={(newSettings) => setAppSettings(newSettings)}
      />
    </Container>
  );
};

export default App;