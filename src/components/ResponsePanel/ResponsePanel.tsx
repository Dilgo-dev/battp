import { useState } from 'react';
import { FileText, Copy, Save, RefreshCw } from 'lucide-react';
import { HttpResponse, HttpError, ResponseTabType } from '../../types';
import { getStatusColor, formatSize } from '../../utils/helpers';
import { ResponseBody } from './ResponseBody';
import { ResponseHeaders } from './ResponseHeaders';

interface ResponsePanelProps {
  response: HttpResponse | null;
  error: HttpError | null;
  isLoading: boolean;
}

export const ResponsePanel = ({ response, error, isLoading }: ResponsePanelProps) => {
  const [activeTab, setActiveTab] = useState<ResponseTabType>("body");

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
          <FileText size={20} />
          <span>RESPONSE</span>
        </h2>

        {/* Status */}
        <div className="flex items-center space-x-4 mb-4">
          {isLoading && (
            <span className="text-sm font-medium text-muted-foreground">
              Loading...
            </span>
          )}
          {error && (
            <span className="text-sm font-medium text-destructive">
              Error: {error.error || error.message}
            </span>
          )}
          {response && (
            <>
              <span
                className={`text-sm font-medium ${getStatusColor(response.status)}`}
              >
                Status: {response.status} {response.status_text} {response.status >= 200 && response.status < 300 ? "✅" : "❌"}
              </span>
              <span className="text-sm text-muted-foreground">
                Time: {response.time_ms}ms
              </span>
              <span className="text-sm text-muted-foreground">
                Size: {formatSize(response.size)}
              </span>
            </>
          )}
        </div>

        {/* Response Tabs */}
        <div className="flex space-x-1 mb-4">
          {(["body", "headers"] as ResponseTabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
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

      {/* Response Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "body" && (
          <ResponseBody response={response} error={error} isLoading={isLoading} />
        )}
        {activeTab === "headers" && (
          <ResponseHeaders response={response} error={error} isLoading={isLoading} />
        )}
      </div>

      {/* Response Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center space-x-2">
            <Copy size={16} />
            <span>Copy</span>
          </button>
          <button className="flex-1 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center space-x-2">
            <Save size={16} />
            <span>Save</span>
          </button>
          <button className="flex-1 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 flex items-center justify-center space-x-2">
            <RefreshCw size={16} />
            <span>Format</span>
          </button>
        </div>
      </div>
    </div>
  );
};