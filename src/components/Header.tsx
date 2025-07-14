import { Plus, Upload, Download, Settings } from 'lucide-react';

interface HeaderProps {
  onNewRequest: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const Header = ({ onNewRequest, onToggleDarkMode, isDarkMode }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🦇</div>
          <h1 className="text-2xl font-bold text-primary">BATTP</h1>
          <span className="text-sm text-muted-foreground">
            Batman API Client
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onNewRequest}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>New Request</span>
          </button>
          <button className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1">
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            onClick={onToggleDarkMode}
            className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};