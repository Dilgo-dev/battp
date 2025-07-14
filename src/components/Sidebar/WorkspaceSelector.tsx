import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { Workspace } from '../../types';

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
  onRenameWorkspace: (workspaceId: string, newName: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
}

export const WorkspaceSelector = ({
  workspaces,
  currentWorkspace,
  onSwitchWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
}: WorkspaceSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingWorkspaceId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWorkspaceClick = (workspaceId: string) => {
    onSwitchWorkspace(workspaceId);
    setIsOpen(false);
  };

  const handleStartEdit = (e: React.MouseEvent, workspace: Workspace) => {
    e.stopPropagation();
    setEditingWorkspaceId(workspace.id);
    setEditingName(workspace.name);
  };

  const handleSaveEdit = (workspaceId: string) => {
    if (editingName.trim() && editingName.trim() !== workspaces.find(ws => ws.id === workspaceId)?.name) {
      onRenameWorkspace(workspaceId, editingName.trim());
    }
    setEditingWorkspaceId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null);
    setEditingName('');
  };

  const handleDeleteClick = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce workspace ?')) {
      onDeleteWorkspace(workspaceId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, workspaceId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(workspaceId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-lg font-semibold text-foreground hover:text-accent transition-colors"
      >
        <span>{currentWorkspace?.name || 'Mon Workspace'}</span>
        <ChevronDown 
          size={16} 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2 px-2 py-1 font-medium">
              WORKSPACES
            </div>
            
            <div className="space-y-1">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`flex items-center justify-between p-2 rounded-md hover:bg-accent/10 cursor-pointer group ${
                    currentWorkspace?.id === workspace.id ? 'bg-accent/20' : ''
                  }`}
                  onClick={() => handleWorkspaceClick(workspace.id)}
                >
                  <div className="flex-1 min-w-0">
                    {editingWorkspaceId === workspace.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, workspace.id)}
                        onBlur={() => handleSaveEdit(workspace.id)}
                        className="w-full bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-accent rounded px-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm text-foreground truncate block">
                        {workspace.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartEdit(e, workspace)}
                      className="p-1 hover:bg-accent/10 rounded"
                      title="Renommer"
                    >
                      <Edit2 size={12} className="text-muted-foreground" />
                    </button>
                    
                    {workspace.id !== 'default' && (
                      <button
                        onClick={(e) => handleDeleteClick(e, workspace.id)}
                        className="p-1 hover:bg-destructive/10 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={12} className="text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border my-2"></div>
            
            <button
              onClick={onCreateWorkspace}
              className="w-full flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
            >
              <Plus size={16} />
              <span>Nouveau workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};