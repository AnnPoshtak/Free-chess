import "./App.css";
import BoardLayout from "./components/BoardLayout/BoardLayout";
import Header from "./components/Header/Header";
import { Container } from "./components/Container/Container";
import React, { useState, useEffect } from 'react';
import Settings from './components/Settings/Setings.tsx';
import type { ChessSettings } from './common/interface/ChessSettings.tsx';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<ChessSettings | null>(null);

  useEffect(() => {
    if (appSettings?.theme) {
      document.body.setAttribute('data-theme', appSettings.theme);
    }
  }, [appSettings?.theme]);

  return (
    <Container>
      <Header onOpenSettings={() => setIsModalOpen(true)} />
      <BoardLayout />
      
      <Settings 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSettingsChange={(newSettings) => setAppSettings(newSettings)}
      />
    </Container>
  );
};

export default App;
