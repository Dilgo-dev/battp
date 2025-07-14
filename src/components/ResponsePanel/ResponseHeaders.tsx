import { HttpResponse, HttpError } from '../../types';

interface ResponseHeadersProps {
  response: HttpResponse | null;
  error: HttpError | null;
  isLoading: boolean;
}

export const ResponseHeaders = ({ response, error, isLoading }: ResponseHeadersProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground mb-2">
        🔍 Response Headers
      </h3>
      <div className="bg-muted border border-border rounded-md p-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Sending request...
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive">
            Request failed: {error.details || error.message}
          </div>
        )}
        {response && (
          <div className="space-y-2 text-sm font-mono">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="text-muted-foreground">
                {key}: {value}
              </div>
            ))}
          </div>
        )}
        {!isLoading && !error && !response && (
          <div className="text-sm text-muted-foreground">
            No response yet. Click SEND to make a request.
          </div>
        )}
      </div>
    </div>
  );
};