import { useState, useEffect } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

export const WindowControls = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };

    checkMaximized();

    // Écouter les événements de redimensionnement
    const unlisten = appWindow.listen('tauri://resize', checkMaximized);
    
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  return (
    <div className="flex items-center h-full">
      <button
        onClick={handleMinimize}
        className="w-11 h-8 flex items-center justify-center hover:bg-muted/50 transition-colors group"
        title="Minimize"
      >
        <Minus size={16} className="text-muted-foreground group-hover:text-foreground" />
      </button>
      
      <button
        onClick={handleMaximize}
        className="w-11 h-8 flex items-center justify-center hover:bg-muted/50 transition-colors group"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? (
          <Copy size={14} className="text-muted-foreground group-hover:text-foreground" />
        ) : (
          <Square size={14} className="text-muted-foreground group-hover:text-foreground" />
        )}
      </button>
      
      <button
        onClick={handleClose}
        className="w-11 h-8 flex items-center justify-center hover:bg-destructive transition-colors group"
        title="Close"
      >
        <X size={16} className="text-muted-foreground group-hover:text-destructive-foreground" />
      </button>
    </div>
  );
};