interface BodyTabProps {
  body: string;
  onChange: (body: string) => void;
  disabled?: boolean;
}

export const BodyTab = ({ body, onChange, disabled = false }: BodyTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground mb-2">
        📦 Body
      </h3>
      <div className="bg-card border border-border rounded-md p-4">
        <textarea
          value={body}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-48 px-3 py-2 bg-input border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
          placeholder="Enter request body (JSON, XML, etc.)"
        />
      </div>
    </div>
  );
};