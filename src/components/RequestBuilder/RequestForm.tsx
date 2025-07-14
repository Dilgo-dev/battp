import { Send } from 'lucide-react';
import { HttpMethod } from '../../types';

interface RequestFormProps {
  method: HttpMethod;
  url: string;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const RequestForm = ({ 
  method, 
  url, 
  onMethodChange, 
  onUrlChange, 
  onSend, 
  disabled = false,
  isLoading = false 
}: RequestFormProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        disabled={disabled}
        className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        placeholder="https://api.example.com/endpoint"
      />
      <button 
        onClick={onSend}
        disabled={disabled || isLoading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
        <span>{isLoading ? "SENDING..." : "SEND"}</span>
      </button>
    </div>
  );
};