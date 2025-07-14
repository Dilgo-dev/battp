import { Trash2 } from 'lucide-react';

interface HeadersTabProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
  disabled?: boolean;
}

export const HeadersTab = ({ headers, onChange, disabled = false }: HeadersTabProps) => {
  const handleHeaderChange = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...headers };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    onChange(newHeaders);
  };

  const handleDeleteHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    onChange(newHeaders);
  };

  const handleAddHeader = () => {
    const newHeaders = { ...headers, "": "" };
    onChange(newHeaders);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground mb-2">
        🔧 Headers
      </h3>
      <div className="bg-card border border-border rounded-md p-4">
        <div className="space-y-3">
          {Object.entries(headers).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <input
                type="text"
                value={key}
                onChange={(e) => handleHeaderChange(key, e.target.value, value)}
                disabled={disabled}
                className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                placeholder="Header name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleHeaderChange(key, key, e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                placeholder="Header value"
              />
              <button
                onClick={() => handleDeleteHeader(key)}
                disabled={disabled}
                className="px-2 py-1 text-red-500 hover:bg-red-500/10 rounded disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddHeader}
            disabled={disabled}
            className="w-full px-2 py-1 border border-dashed border-border rounded text-sm text-muted-foreground hover:border-primary disabled:opacity-50"
          >
            + Add Header
          </button>
        </div>
      </div>
    </div>
  );
};