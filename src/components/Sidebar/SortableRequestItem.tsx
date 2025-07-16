import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash2, GripVertical } from 'lucide-react';
import { HttpRequest } from '../../types';
import { getMethodColor } from '../../utils/helpers';

interface SortableRequestItemProps {
  request: HttpRequest;
  isSelected: boolean;
  onSelectRequest: (requestId: number) => void;
  onDeleteRequest: (requestId: number) => void;
}

export const SortableRequestItem = ({ 
  request, 
  isSelected, 
  onSelectRequest, 
  onDeleteRequest 
}: SortableRequestItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this request?')) {
      onDeleteRequest(request.id);
    }
  };

  const handleRequestClick = () => {
    onSelectRequest(request.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleRequestClick}
      className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer group ${
        isSelected ? "bg-accent/20" : ""
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical size={14} className="text-muted-foreground" />
      </div>

      {/* Method Badge */}
      <span className={`text-xs font-medium ${getMethodColor(request.method)}`}>
        {request.method}
      </span>

      {/* Request Content */}
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

      {/* Action Icons */}
      <div className="flex items-center space-x-1">
        {request.favorite && (
          <Star
            size={12}
            className="text-accent-foreground fill-current"
          />
        )}
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-opacity"
          title="Delete request"
        >
          <Trash2 size={12} className="text-destructive" />
        </button>
      </div>
    </div>
  );
};