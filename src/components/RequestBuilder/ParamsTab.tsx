import { Trash2 } from 'lucide-react';

interface ParamsTabProps {
  params: Record<string, string>;
  onChange: (params: Record<string, string>) => void;
  disabled?: boolean;
}

export const ParamsTab = ({ params, onChange, disabled = false }: ParamsTabProps) => {
  const handleParamChange = (oldKey: string, newKey: string, value: string) => {
    const newParams = { ...params };
    if (oldKey !== newKey) {
      delete newParams[oldKey];
    }
    newParams[newKey] = value;
    onChange(newParams);
  };

  const handleDeleteParam = (key: string) => {
    const newParams = { ...params };
    delete newParams[key];
    onChange(newParams);
  };

  const handleAddParam = () => {
    const newParams = { ...params, "": "" };
    onChange(newParams);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground mb-2">
        🔍 Query Params
      </h3>
      <div className="bg-card border border-border rounded-md p-4">
        <div className="space-y-3">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <input
                type="text"
                value={key}
                onChange={(e) => handleParamChange(key, e.target.value, value)}
                disabled={disabled}
                className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                placeholder="Parameter name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleParamChange(key, key, e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                placeholder="Parameter value"
              />
              <button
                onClick={() => handleDeleteParam(key)}
                disabled={disabled}
                className="px-2 py-1 text-red-500 hover:bg-red-500/10 rounded disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddParam}
            disabled={disabled}
            className="w-full px-2 py-1 border border-dashed border-border rounded text-sm text-muted-foreground hover:border-primary disabled:opacity-50"
          >
            + Add Parameter
          </button>
        </div>
      </div>
    </div>
  );
};