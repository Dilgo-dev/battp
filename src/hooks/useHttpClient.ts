import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HttpResponse, HttpError, RequestFormData } from '../types';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [error, setError] = useState<HttpError | null>(null);

  const sendRequest = useCallback(async (requestData: RequestFormData) => {
    // Validation
    if (!requestData.url.trim()) {
      setError({ error: "Please enter a URL" });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire l'URL avec les paramètres de requête pour les requêtes GET
      let finalUrl = requestData.url;
      if (requestData.method === "GET" && Object.keys(requestData.params).length > 0) {
        const urlObj = new URL(requestData.url);
        Object.entries(requestData.params).forEach(([key, value]) => {
          if (value) {
            urlObj.searchParams.append(key, value);
          }
        });
        finalUrl = urlObj.toString();
      }

      const httpRequest = {
        url: finalUrl,
        method: requestData.method,
        headers: requestData.headers,
        body: (requestData.method !== "GET" && requestData.body) ? requestData.body : null,
      };

      const result = await invoke<HttpResponse>("send_http_request", { request: httpRequest });
      setResponse(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    response,
    error,
    sendRequest,
    clearResponse,
    clearError,
  };
};