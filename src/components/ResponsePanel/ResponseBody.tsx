import { HttpResponse, HttpError } from '../../types';
import { formatResponseBody } from '../../utils/helpers';

interface ResponseBodyProps {
  response: HttpResponse | null;
  error: HttpError | null;
  isLoading: boolean;
}

export const ResponseBody = ({ response, error, isLoading }: ResponseBodyProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground mb-2">
        📊 Response Body
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
          <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
            {formatResponseBody(response.body)}
          </pre>
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