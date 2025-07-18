import { Plus, Sun, Moon } from 'lucide-react';
import { WindowControls } from './WindowControls';

interface HeaderProps {
  onNewRequest: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const Header = ({ onNewRequest, onToggleDarkMode, isDarkMode }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between">
        {/* Zone draggable pour déplacer la fenêtre */}
        <div 
          className="flex items-center space-x-3 px-6 py-3 flex-1"
          data-tauri-drag-region
        >
          <div className="text-2xl">🦇</div>
          <h1 className="text-2xl font-bold text-primary">BATHTTP</h1>
          <span className="text-sm text-muted-foreground">
            Batman API Client
          </span>
        </div>
        
        {/* Boutons d'actions (non-draggable) */}
        <div className="flex items-center space-x-2 px-6 py-3">
          <button 
            onClick={onNewRequest}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>New Request</span>
          </button>
          <button
            onClick={onToggleDarkMode}
            className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
        
        {/* Boutons de contrôle de fenêtre */}
        <WindowControls />
      </div>
    </header>
  );
};