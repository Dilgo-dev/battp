import { useState } from 'react';
import { Zap, Edit2, Check, X } from 'lucide-react';
import { HttpRequest, TabType, RequestFormData } from '../../types';
import { RequestForm } from './RequestForm';
import { HeadersTab } from './HeadersTab';
import { BodyTab } from './BodyTab';
import { ParamsTab } from './ParamsTab';

interface RequestBuilderProps {
  selectedRequest: HttpRequest | null;
  formData: RequestFormData | null;
  onFormChange: (field: keyof RequestFormData, value: any) => void;
  onUpdateRequestName: (newName: string) => void;
  onSendRequest: () => void;
  isLoading: boolean;
}

export const RequestBuilder = ({ 
  selectedRequest, 
  formData, 
  onFormChange, 
  onUpdateRequestName,
  onSendRequest, 
  isLoading 
}: RequestBuilderProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("headers");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const isSendDisabled = !selectedRequest || !formData?.url.trim() || isLoading;

  const handleStartEdit = () => {
    if (selectedRequest) {
      setEditedName(selectedRequest.name);
      setIsEditingName(true);
    }
  };

  const handleSaveEdit = () => {
    if (editedName.trim()) {
      onUpdateRequestName(editedName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Zap size={20} className="text-accent" />
          <span>REQUEST BUILDER</span>
          {selectedRequest && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">-</span>
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    className="text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 hover:bg-accent/10 rounded"
                    title="Save"
                  >
                    <Check size={12} className="text-success" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 hover:bg-accent/10 rounded"
                    title="Cancel"
                  >
                    <X size={12} className="text-destructive" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center space-x-1 hover:bg-accent/10 rounded px-1 py-0.5 group"
                  title="Edit request name"
                >
                  <span className="text-sm text-muted-foreground">
                    {selectedRequest.name}
                  </span>
                  <Edit2 size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          )}
        </h2>
        
        {!selectedRequest && (
          <div className="mb-4 p-3 bg-muted border border-border rounded-md">
            <p className="text-sm text-muted-foreground">
              📝 Please create a new request or select an existing one to get started.
            </p>
          </div>
        )}

        {formData && (
          <RequestForm
            method={formData.method}
            url={formData.url}
            onMethodChange={(method) => onFormChange('method', method)}
            onUrlChange={(url) => onFormChange('url', url)}
            onSend={onSendRequest}
            disabled={!selectedRequest}
            isLoading={isLoading}
          />
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          {(["headers", "body", "params"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${
                activeTab === tab
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4">
        {activeTab === "headers" && formData && (
          <HeadersTab
            headers={formData.headers}
            onChange={(headers) => onFormChange('headers', headers)}
            disabled={!selectedRequest}
          />
        )}

        {activeTab === "body" && formData && (
          <BodyTab
            body={formData.body}
            onChange={(body) => onFormChange('body', body)}
            disabled={!selectedRequest}
          />
        )}

        {activeTab === "params" && formData && (
          <ParamsTab
            params={formData.params}
            onChange={(params) => onFormChange('params', params)}
            disabled={!selectedRequest}
          />
        )}
      </div>
    </div>
  );
};