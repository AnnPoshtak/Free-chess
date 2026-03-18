export interface ChessSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  showAvailableMoves: boolean;
  showMoveHistory: boolean;
  boardStyle: 'classic' | 'green' | 'blue';
  pieceStyle: 'Classic' | 'Kosal' | 'Horsey' | 'Pixel' | 'Riohacha';
  difficulty: 'easy' | 'medium' | 'hard';
}