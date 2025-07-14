import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Workspace, WorkspaceData, HttpRequest } from "../types";

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] =
    useState<string>("default");
  const [requestsByWorkspace, setRequestsByWorkspace] = useState<
    Record<string, HttpRequest[]>
  >({});
  const [selectedRequestIdByWorkspace, setSelectedRequestIdByWorkspace] =
    useState<Record<string, number | null>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour sauvegarder les workspaces avec debouncing
  const saveWorkspaces = useCallback(
    async (data: WorkspaceData) => {
      if (!isLoaded) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await invoke("save_workspaces", {
            workspaceData: {
              workspaces: data.workspaces.map((ws) => ({
                id: ws.id,
                name: ws.name,
                created_at: ws.createdAt,
              })),
              current_workspace_id: data.currentWorkspaceId,
              requests_by_workspace: Object.fromEntries(
                Object.entries(data.requestsByWorkspace).map(
                  ([key, requests]) => [
                    key,
                    requests.map((req) => ({
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
                  ]
                )
              ),
              selected_request_id_by_workspace:
                data.selectedRequestIdByWorkspace,
            },
          });
        } catch (error) {
          console.error("Erreur lors de la sauvegarde des workspaces:", error);
        }
      }, 500);
    },
    [isLoaded]
  );

  // Charger les workspaces au démarrage
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await invoke<any>("load_workspaces");

        setWorkspaces(
          data.workspaces.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            createdAt: ws.created_at,
            syncPath: ws.sync_path,
          }))
        );

        setCurrentWorkspaceId(data.current_workspace_id);

        // Convertir les requêtes
        const requestsConverted: Record<string, HttpRequest[]> = {};
        Object.entries(data.requests_by_workspace || {}).forEach(
          ([key, requests]: [string, any]) => {
            requestsConverted[key] = requests.map((req: any) => ({
              id: req.id,
              name: req.name,
              method: req.method,
              url: req.url,
              headers: req.headers,
              body: req.body,
              params: req.params,
              favorite: req.favorite,
              createdAt: req.created_at,
            }));
          }
        );

        setRequestsByWorkspace(requestsConverted);
        setSelectedRequestIdByWorkspace(
          data.selected_request_id_by_workspace || {}
        );
        setIsLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement des workspaces:", error);
        setIsLoaded(true);
      }
    };

    loadWorkspaces();
  }, []);

  // Sauvegarder automatiquement lors des changements
  useEffect(() => {
    if (isLoaded) {
      const data: WorkspaceData = {
        workspaces,
        currentWorkspaceId,
        requestsByWorkspace,
        selectedRequestIdByWorkspace,
      };
      saveWorkspaces(data);
    }
  }, [
    workspaces,
    currentWorkspaceId,
    requestsByWorkspace,
    selectedRequestIdByWorkspace,
    saveWorkspaces,
    isLoaded,
  ]);

  // Créer un nouveau workspace
  const createWorkspace = useCallback(
    async (name: string, syncPath?: string) => {
      try {
        const newWorkspace = await invoke<any>("create_workspace_with_path", {
          name,
          syncPath: syncPath || null,
        });

        const workspace: Workspace = {
          id: newWorkspace.id,
          name: newWorkspace.name,
          createdAt: newWorkspace.created_at,
          syncPath: newWorkspace.sync_path,
        };

        setWorkspaces((prev) => [...prev, workspace]);

        // Si c'est un import, charger les requêtes existantes
        if (syncPath && newWorkspace.sync_path) {
          try {
            const workspaceData = await loadWorkspaceFromPath(syncPath);
            setRequestsByWorkspace((prev) => ({
              ...prev,
              [workspace.id]: workspaceData.requests,
            }));
            setSelectedRequestIdByWorkspace((prev) => ({
              ...prev,
              [workspace.id]: workspaceData.selectedRequestId,
            }));
          } catch (error) {
            console.warn(
              "Impossible de charger les requêtes du workspace:",
              error
            );
            setRequestsByWorkspace((prev) => ({ ...prev, [workspace.id]: [] }));
            setSelectedRequestIdByWorkspace((prev) => ({
              ...prev,
              [workspace.id]: null,
            }));
          }
        } else {
          setRequestsByWorkspace((prev) => ({ ...prev, [workspace.id]: [] }));
          setSelectedRequestIdByWorkspace((prev) => ({
            ...prev,
            [workspace.id]: null,
          }));
        }

        return workspace;
      } catch (error) {
        console.error("Erreur lors de la création du workspace:", error);
        throw error;
      }
    },
    []
  );

  // Supprimer un workspace
  const deleteWorkspace = useCallback(
    async (workspaceId: string) => {
      try {
        await invoke("delete_workspace", { workspaceId });

        setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
        setRequestsByWorkspace((prev) => {
          const newState = { ...prev };
          delete newState[workspaceId];
          return newState;
        });
        setSelectedRequestIdByWorkspace((prev) => {
          const newState = { ...prev };
          delete newState[workspaceId];
          return newState;
        });

        // Si on supprime le workspace actuel, changer pour le défaut
        if (currentWorkspaceId === workspaceId) {
          setCurrentWorkspaceId("default");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du workspace:", error);
        throw error;
      }
    },
    [currentWorkspaceId]
  );

  // Changer de workspace
  const switchWorkspace = useCallback((workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
  }, []);

  // Renommer un workspace
  const renameWorkspace = useCallback(
    (workspaceId: string, newName: string) => {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === workspaceId ? { ...ws, name: newName } : ws
        )
      );
    },
    []
  );

  // Obtenir le workspace actuel
  const getCurrentWorkspace = useCallback(() => {
    return workspaces.find((ws) => ws.id === currentWorkspaceId) || null;
  }, [workspaces, currentWorkspaceId]);

  // Obtenir les requêtes du workspace actuel
  const getCurrentWorkspaceRequests = useCallback(() => {
    return requestsByWorkspace[currentWorkspaceId] || [];
  }, [requestsByWorkspace, currentWorkspaceId]);

  // Obtenir l'ID de la requête sélectionnée pour le workspace actuel
  const getCurrentSelectedRequestId = useCallback(() => {
    return selectedRequestIdByWorkspace[currentWorkspaceId] || null;
  }, [selectedRequestIdByWorkspace, currentWorkspaceId]);

  // Fonction pour synchroniser un workspace vers son chemin
  const syncWorkspaceToPath = useCallback(
    async (workspaceId: string) => {
      const workspace = workspaces.find((ws) => ws.id === workspaceId);
      if (!workspace || !workspace.syncPath) return;

      try {
        const requests = requestsByWorkspace[workspaceId] || [];
        const selectedRequestId =
          selectedRequestIdByWorkspace[workspaceId] || null;

        await invoke("sync_workspace_to_path", {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            created_at: workspace.createdAt,
            sync_path: workspace.syncPath,
          },
          requests: requests.map((req) => ({
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
          selected_request_id: selectedRequestId,
          path: workspace.syncPath,
        });
      } catch (error) {
        console.error("Erreur lors de la synchronisation:", error);
        throw error;
      }
    },
    [workspaces, requestsByWorkspace, selectedRequestIdByWorkspace]
  );

  // Mettre à jour les requêtes du workspace actuel
  const updateCurrentWorkspaceRequests = useCallback(
    (requests: HttpRequest[]) => {
      setRequestsByWorkspace((prev) => ({
        ...prev,
        [currentWorkspaceId]: requests,
      }));

      // Synchroniser automatiquement si le workspace a un chemin
      const currentWorkspace = workspaces.find(
        (ws) => ws.id === currentWorkspaceId
      );
      if (currentWorkspace?.syncPath) {
        syncWorkspaceToPath(currentWorkspaceId);
      }
    },
    [currentWorkspaceId, workspaces, syncWorkspaceToPath]
  );

  // Mettre à jour l'ID de la requête sélectionnée pour le workspace actuel
  const updateCurrentSelectedRequestId = useCallback(
    (requestId: number | null) => {
      setSelectedRequestIdByWorkspace((prev) => ({
        ...prev,
        [currentWorkspaceId]: requestId,
      }));

      // Synchroniser automatiquement si le workspace a un chemin
      const currentWorkspace = workspaces.find(
        (ws) => ws.id === currentWorkspaceId
      );
      if (currentWorkspace?.syncPath) {
        syncWorkspaceToPath(currentWorkspaceId);
      }
    },
    [currentWorkspaceId, workspaces, syncWorkspaceToPath]
  );

  // Fonction pour charger un workspace depuis un chemin
  const loadWorkspaceFromPath = useCallback(async (path: string) => {
    try {
      const data = await invoke<any>("import_workspace_from_path", { path });
      return {
        requests:
          data.requests?.map((req: any) => ({
            id: req.id,
            name: req.name,
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            params: req.params,
            favorite: req.favorite,
            createdAt: req.created_at,
          })) || [],
        selectedRequestId: data.selected_request_id || null,
      };
    } catch (error) {
      console.error("Erreur lors du chargement du workspace:", error);
      throw error;
    }
  }, []);

  // Nettoyage du timeout à la désactivation
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    workspaces,
    currentWorkspaceId,
    getCurrentWorkspace,
    getCurrentWorkspaceRequests,
    getCurrentSelectedRequestId,
    updateCurrentWorkspaceRequests,
    updateCurrentSelectedRequestId,
    createWorkspace,
    deleteWorkspace,
    switchWorkspace,
    renameWorkspace,
    loadWorkspaceFromPath,
    syncWorkspaceToPath,
    isLoaded,
  };
};
