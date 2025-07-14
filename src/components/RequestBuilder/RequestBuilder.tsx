import { useState } from 'react';
import { Zap } from 'lucide-react';
import { HttpRequest, TabType, RequestFormData } from '../../types';
import { RequestForm } from './RequestForm';
import { HeadersTab } from './HeadersTab';
import { BodyTab } from './BodyTab';
import { ParamsTab } from './ParamsTab';

interface RequestBuilderProps {
  selectedRequest: HttpRequest | null;
  formData: RequestFormData | null;
  onFormChange: (field: keyof RequestFormData, value: any) => void;
  onSendRequest: () => void;
  isLoading: boolean;
}

export const RequestBuilder = ({ 
  selectedRequest, 
  formData, 
  onFormChange, 
  onSendRequest, 
  isLoading 
}: RequestBuilderProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("headers");

  const isSendDisabled = !selectedRequest || !formData?.url.trim() || isLoading;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Zap size={20} className="text-accent" />
          <span>REQUEST BUILDER</span>
          {selectedRequest && (
            <span className="text-sm text-muted-foreground">
              - {selectedRequest.name}
            </span>
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