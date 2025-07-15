import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { RequestBuilder } from "./components/RequestBuilder/RequestBuilder";
import { ResponsePanel } from "./components/ResponsePanel/ResponsePanel";
import { WorkspaceModal } from "./components/Modal/WorkspaceModal";
import { useRequests } from "./hooks/useRequests";
import { useWorkspaces } from "./hooks/useWorkspaces";
import { useHttpClient } from "./hooks/useHttpClient";
import { RequestFormData } from "./types";

const BathttpApp = () => {
  // États pour l'interface
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  
  // Hooks personnalisés
  const {
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
    isLoaded: isWorkspacesLoaded,
  } = useWorkspaces();

  const {
    savedRequests,
    selectedRequestId,
    createNewRequest,
    selectRequest,
    updateSelectedRequest,
    deleteRequest,
    getSelectedRequest,
    getCurrentFormData,
    favorites,
    recent,
    isLoaded: isRequestsLoaded,
  } = useRequests();
  
  const { isLoading, response, error, sendRequest } = useHttpClient();

  // Handlers
  const handleNewRequest = () => {
    if (isWorkspacesLoaded) {
      // Créer la requête dans le système classique
      const newRequest = createNewRequest();
      
      // Ajouter la requête au workspace actuel
      const currentRequests = getCurrentWorkspaceRequests();
      updateCurrentWorkspaceRequests([...currentRequests, newRequest]);
      
      // Sélectionner la nouvelle requête dans le workspace
      updateCurrentSelectedRequestId(newRequest.id);
    } else {
      // Système classique
      createNewRequest();
    }
  };

  const handleSelectRequest = (requestId: number) => {
    if (isWorkspacesLoaded) {
      // Sélectionner dans le workspace actuel
      updateCurrentSelectedRequestId(requestId);
    } else {
      // Système classique
      selectRequest(requestId);
    }
  };

  const handleDeleteRequest = (requestId: number) => {
    if (isWorkspacesLoaded) {
      // Supprimer du workspace actuel
      const currentRequests = getCurrentWorkspaceRequests();
      const updatedRequests = currentRequests.filter(req => req.id !== requestId);
      updateCurrentWorkspaceRequests(updatedRequests);
      
      // Si c'était la requête sélectionnée, la désélectionner
      if (getCurrentSelectedRequestId() === requestId) {
        updateCurrentSelectedRequestId(null);
      }
    } else {
      // Système classique
      deleteRequest(requestId);
    }
  };

  const handleFormChange = (field: keyof RequestFormData, value: any) => {
    if (isWorkspacesLoaded) {
      // Mettre à jour dans le workspace actuel
      const currentRequests = getCurrentWorkspaceRequests();
      const selectedId = getCurrentSelectedRequestId();
      
      if (selectedId) {
        const updatedRequests = currentRequests.map(req => 
          req.id === selectedId ? { ...req, [field]: value } : req
        );
        updateCurrentWorkspaceRequests(updatedRequests);
      }
    } else {
      // Système classique
      updateSelectedRequest(field, value);
    }
  };

  const handleUpdateRequestName = (newName: string) => {
    if (isWorkspacesLoaded) {
      // Mettre à jour dans le workspace actuel
      const currentRequests = getCurrentWorkspaceRequests();
      const selectedId = getCurrentSelectedRequestId();
      
      if (selectedId) {
        const updatedRequests = currentRequests.map(req => 
          req.id === selectedId ? { ...req, name: newName } : req
        );
        updateCurrentWorkspaceRequests(updatedRequests);
      }
    } else {
      // Système classique
      updateSelectedRequest('name', newName);
    }
  };

  const handleSendRequest = () => {
    const formData = getCurrentFormDataForWorkspace();
    if (formData) {
      sendRequest(formData);
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handlers pour les workspaces
  const handleCreateWorkspace = () => {
    setIsWorkspaceModalOpen(true);
  };

  const handleConfirmCreateWorkspace = async (name: string, syncPath?: string) => {
    try {
      await createWorkspace(name, syncPath);
    } catch (error) {
      console.error('Erreur lors de la création du workspace:', error);
    }
  };

  const handleSwitchWorkspace = (workspaceId: string) => {
    switchWorkspace(workspaceId);
  };

  const handleRenameWorkspace = (workspaceId: string, newName: string) => {
    renameWorkspace(workspaceId, newName);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      await deleteWorkspace(workspaceId);
    } catch (error) {
      console.error('Erreur lors de la suppression du workspace:', error);
    }
  };

  // Obtenir les données du formulaire actuel
  const getSelectedRequestForWorkspace = () => {
    if (isWorkspacesLoaded) {
      const selectedId = getCurrentSelectedRequestId();
      const requests = getCurrentWorkspaceRequests();
      return requests.find(req => req.id === selectedId) || null;
    }
    return getSelectedRequest();
  };

  const getCurrentFormDataForWorkspace = () => {
    const selectedRequest = getSelectedRequestForWorkspace();
    if (!selectedRequest) return null;
    
    return {
      method: selectedRequest.method,
      url: selectedRequest.url,
      headers: selectedRequest.headers,
      body: selectedRequest.body,
      params: selectedRequest.params,
    };
  };

  const selectedRequest = getSelectedRequestForWorkspace();
  const formData = getCurrentFormDataForWorkspace();
  
  // Utiliser les requêtes du workspace actuel ou les requêtes globales
  const currentWorkspaceRequests = isWorkspacesLoaded ? getCurrentWorkspaceRequests() : savedRequests;
  const currentSelectedRequestId = isWorkspacesLoaded ? getCurrentSelectedRequestId() : selectedRequestId;
  const currentWorkspace = getCurrentWorkspace();
  
  // Calculer les favoris et récents du workspace actuel
  const workspaceFavorites = currentWorkspaceRequests.filter(req => req.favorite);
  const workspaceRecent = currentWorkspaceRequests.slice(0, 3);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-background text-foreground flex flex-col">
        <Header 
          onNewRequest={handleNewRequest}
          onToggleDarkMode={handleToggleDarkMode}
          isDarkMode={isDarkMode}
        />
        
        <div className="flex-1 flex">
          <Sidebar 
            requests={currentWorkspaceRequests}
            selectedRequestId={currentSelectedRequestId}
            onSelectRequest={handleSelectRequest}
            onDeleteRequest={handleDeleteRequest}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            favorites={workspaceFavorites}
            recent={workspaceRecent}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onSwitchWorkspace={handleSwitchWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
            onRenameWorkspace={handleRenameWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
          />
          
          <RequestBuilder 
            selectedRequest={selectedRequest}
            formData={formData}
            onFormChange={handleFormChange}
            onUpdateRequestName={handleUpdateRequestName}
            onSendRequest={handleSendRequest}
            isLoading={isLoading}
          />
          
          <ResponsePanel 
            response={response}
            error={error}
            isLoading={isLoading}
          />
        </div>
        
        <WorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          onConfirm={handleConfirmCreateWorkspace}
          title="Créer un workspace"
          existingNames={workspaces.map(ws => ws.name)}
        />
      </div>
    </div>
  );
};

export default BathttpApp;