import { Star, Clock } from 'lucide-react';
import { HttpRequest, Workspace } from '../../types';
import { SearchBar } from './SearchBar';
import { RequestsList } from './RequestsList';
import { WorkspaceSelector } from './WorkspaceSelector';
import { getMethodColor } from '../../utils/helpers';

interface SidebarProps {
  requests: HttpRequest[];
  selectedRequestId: number | null;
  onSelectRequest: (requestId: number) => void;
  onDeleteRequest: (requestId: number) => void;
  onReorderRequests: (requests: HttpRequest[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  favorites: HttpRequest[];
  recent: HttpRequest[];
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
  onRenameWorkspace: (workspaceId: string, newName: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
}

export const Sidebar = ({ 
  requests, 
  selectedRequestId, 
  onSelectRequest, 
  onDeleteRequest,
  onReorderRequests,
  searchTerm, 
  onSearchChange, 
  favorites, 
  recent,
  workspaces,
  currentWorkspace,
  onSwitchWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace
}: SidebarProps) => {
  return (
    <div className="w-80 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="mb-3">
          <WorkspaceSelector
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onSwitchWorkspace={onSwitchWorkspace}
            onCreateWorkspace={onCreateWorkspace}
            onRenameWorkspace={onRenameWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
          />
        </div>
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <RequestsList 
          requests={requests} 
          selectedRequestId={selectedRequestId} 
          onSelectRequest={onSelectRequest} 
          onDeleteRequest={onDeleteRequest}
          onReorderRequests={onReorderRequests}
        />

        {/* Favorites */}
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
            <Star size={16} />
            <span>Favorites</span>
          </h3>
          <div className="space-y-1">
            {favorites.map((request) => (
              <div
                key={request.id}
                onClick={() => onSelectRequest(request.id)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
              >
                <Star
                  size={14}
                  className="text-accent-foreground fill-current"
                />
                <span className="text-sm text-foreground">
                  {request.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
            <Clock size={16} />
            <span>Recent</span>
          </h3>
          <div className="space-y-1">
            {recent.map((request) => (
              <div
                key={request.id}
                onClick={() => onSelectRequest(request.id)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
              >
                <span
                  className={`text-xs font-medium ${getMethodColor(request.method)}`}
                >
                  {request.method}
                </span>
                <span className="text-sm text-foreground truncate">
                  {request.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};