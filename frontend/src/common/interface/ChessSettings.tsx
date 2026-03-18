export interface ChessSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  showAvailableMoves: boolean;
  showMoveHistory: boolean;
  boardStyle: 'classic' | 'green' | 'blue';
  pieceStyle: 'Classic' | 'Kosal' | 'Pixel' | 'Riohacha';
  difficulty: 'easy' | 'medium' | 'hard';
}