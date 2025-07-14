import { useState, useCallback } from 'react';
import { HttpRequest, RequestFormData } from '../types';
import { generateRequestId, createEmptyRequest } from '../utils/helpers';

export const useRequests = () => {
  const [savedRequests, setSavedRequests] = useState<HttpRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const createNewRequest = useCallback(() => {
    const id = generateRequestId();
    const newRequest = createEmptyRequest(id);
    
    setSavedRequests(prev => [...prev, newRequest]);
    setSelectedRequestId(id);
    
    return newRequest;
  }, []);

  const selectRequest = useCallback((requestId: number) => {
    setSelectedRequestId(requestId);
  }, []);

  const updateRequest = useCallback((requestId: number, field: keyof HttpRequest, value: any) => {
    setSavedRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, [field]: value }
          : req
      )
    );
  }, []);

  const updateSelectedRequest = useCallback((field: keyof HttpRequest, value: any) => {
    if (selectedRequestId) {
      updateRequest(selectedRequestId, field, value);
    }
  }, [selectedRequestId, updateRequest]);

  const deleteRequest = useCallback((requestId: number) => {
    setSavedRequests(prev => prev.filter(req => req.id !== requestId));
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
    }
  }, [selectedRequestId]);

  const getSelectedRequest = useCallback(() => {
    return savedRequests.find(req => req.id === selectedRequestId) || null;
  }, [savedRequests, selectedRequestId]);

  const getCurrentFormData = useCallback((): RequestFormData | null => {
    const selectedRequest = getSelectedRequest();
    if (!selectedRequest) return null;
    
    return {
      method: selectedRequest.method,
      url: selectedRequest.url,
      headers: selectedRequest.headers,
      body: selectedRequest.body,
      params: selectedRequest.params,
    };
  }, [getSelectedRequest]);

  const favorites = savedRequests.filter(req => req.favorite);
  const recent = savedRequests.slice(0, 3);

  return {
    savedRequests,
    selectedRequestId,
    createNewRequest,
    selectRequest,
    updateRequest,
    updateSelectedRequest,
    deleteRequest,
    getSelectedRequest,
    getCurrentFormData,
    favorites,
    recent,
  };
};