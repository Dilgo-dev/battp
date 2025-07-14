import { useState, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { HttpRequest, RequestFormData } from '../types';
import { generateRequestId, createEmptyRequest } from '../utils/helpers';

interface RequestsData {
  requests: HttpRequest[];
  selected_request_id: number | null;
}

export const useRequests = () => {
  const [savedRequests, setSavedRequests] = useState<HttpRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fonction pour sauvegarder les requêtes avec debouncing
  const saveRequests = useCallback(async (requests: HttpRequest[], selectedId: number | null) => {
    if (!isLoaded) return; // Ne pas sauvegarder pendant le chargement initial
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await invoke('save_requests', {
          requestsData: {
            requests: requests.map(req => ({
              id: req.id,
              name: req.name,
              method: req.method,
              url: req.url,
              headers: req.headers,
              body: req.body,
              params: req.params,
              favorite: req.favorite,
              created_at: req.createdAt,
            })),
            selected_request_id: selectedId,
          }
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }, 500); // Debounce de 500ms
  }, [isLoaded]);

  // Charger les requêtes au démarrage
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await invoke<RequestsData>('load_requests');
        setSavedRequests(data.requests.map(req => ({
          id: req.id,
          name: req.name,
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          params: req.params,
          favorite: req.favorite,
          createdAt: req.created_at,
        })));
        setSelectedRequestId(data.selected_request_id);
        setIsLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setIsLoaded(true);
      }
    };

    loadRequests();
  }, []);

  // Sauvegarder automatiquement lors des changements
  useEffect(() => {
    if (isLoaded) {
      saveRequests(savedRequests, selectedRequestId);
    }
  }, [savedRequests, selectedRequestId, saveRequests, isLoaded]);

  // Nettoyage du timeout à la désactivation
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
    isLoaded,
  };
};