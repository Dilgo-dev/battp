import { FileText } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { HttpRequest } from '../../types';
import { SortableRequestItem } from './SortableRequestItem';

interface RequestsListProps {
  requests: HttpRequest[];
  selectedRequestId: number | null;
  onSelectRequest: (requestId: number) => void;
  onDeleteRequest: (requestId: number) => void;
  onReorderRequests: (requests: HttpRequest[]) => void;
}

export const RequestsList = ({ requests, selectedRequestId, onSelectRequest, onDeleteRequest, onReorderRequests }: RequestsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = requests.findIndex((request) => request.id === active.id);
      const newIndex = requests.findIndex((request) => request.id === over.id);

      const newRequests = arrayMove(requests, oldIndex, newIndex);
      onReorderRequests(newRequests);
    }
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={requests.map(r => r.id)} strategy={verticalListSortingStrategy}>
              {requests.map((request) => (
                <SortableRequestItem
                  key={request.id}
                  request={request}
                  isSelected={selectedRequestId === request.id}
                  onSelectRequest={onSelectRequest}
                  onDeleteRequest={onDeleteRequest}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};