import { Star, FileText } from 'lucide-react';
import { HttpRequest } from '../../types';
import { getMethodColor } from '../../utils/helpers';

interface RequestsListProps {
  requests: HttpRequest[];
  selectedRequestId: number | null;
  onSelectRequest: (requestId: number) => void;
}

export const RequestsList = ({ requests, selectedRequestId, onSelectRequest }: RequestsListProps) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
        <FileText size={16} />
        <span>Saved Requests</span>
      </h3>
      <div className="space-y-1">
        {requests.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            No saved requests yet. Click "New Request" to create one.
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              onClick={() => onSelectRequest(request.id)}
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer ${
                selectedRequestId === request.id ? "bg-accent/20" : ""
              }`}
            >
              <span
                className={`text-xs font-medium ${getMethodColor(request.method)}`}
              >
                {request.method}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {request.name}
                </div>
                {request.url && (
                  <div className="text-xs text-muted-foreground truncate">
                    {request.url}
                  </div>
                )}
              </div>
              {request.favorite && (
                <Star
                  size={12}
                  className="text-accent-foreground fill-current"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};