import { useState, useEffect } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, syncPath?: string) => void;
  initialName?: string;
  title: string;
  existingNames: string[];
}

export const WorkspaceModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialName = '',
  title,
  existingNames,
}: WorkspaceModalProps) => {
  const [name, setName] = useState(initialName);
  const [syncPath, setSyncPath] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setSyncPath('');
      setError('');
    }
  }, [isOpen, initialName]);

  const validateName = (inputName: string) => {
    if (!inputName.trim()) {
      return 'Le nom du workspace est requis';
    }
    
    if (inputName.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (inputName.trim().length > 50) {
      return 'Le nom ne peut pas dépasser 50 caractères';
    }
    
    if (existingNames.includes(inputName.trim()) && inputName.trim() !== initialName) {
      return 'Un workspace avec ce nom existe déjà';
    }
    
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onConfirm(name.trim(), syncPath.trim() || undefined);
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Validation en temps réel
    if (error) {
      const validationError = validateName(newName);
      setError(validationError);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionner un dossier pour le workspace',
      });
      
      if (selected && typeof selected === 'string') {
        setSyncPath(selected);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4 shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label
              htmlFor="workspace-name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Nom du workspace
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                error ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Mon nouveau workspace"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label
              htmlFor="sync-path"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Chemin de synchronisation <span className="text-muted-foreground">(optionnel)</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="sync-path"
                type="text"
                value={syncPath}
                onChange={(e) => setSyncPath(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Sélectionner un dossier ou saisir un chemin"
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3 py-2 border border-border rounded-md hover:bg-accent/10 transition-colors"
                title="Parcourir"
              >
                <FolderOpen size={16} />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Si spécifié, le workspace sera synchronisé avec ce dossier pour faciliter le partage.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent/10 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !!error}
              className="px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};