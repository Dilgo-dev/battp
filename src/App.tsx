import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { RequestBuilder } from "./components/RequestBuilder/RequestBuilder";
import { ResponsePanel } from "./components/ResponsePanel/ResponsePanel";
import { useRequests } from "./hooks/useRequests";
import { useHttpClient } from "./hooks/useHttpClient";
import { RequestFormData } from "./types";

const BattpApp = () => {
  // États pour l'interface
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hooks personnalisés
  const {
    savedRequests,
    selectedRequestId,
    createNewRequest,
    selectRequest,
    updateSelectedRequest,
    getSelectedRequest,
    getCurrentFormData,
    favorites,
    recent,
  } = useRequests();
  
  const { isLoading, response, error, sendRequest } = useHttpClient();

  // Handlers
  const handleNewRequest = () => {
    createNewRequest();
  };

  const handleSelectRequest = (requestId: number) => {
    selectRequest(requestId);
  };

  const handleFormChange = (field: keyof RequestFormData, value: any) => {
    updateSelectedRequest(field, value);
  };

  const handleSendRequest = () => {
    const formData = getCurrentFormData();
    if (formData) {
      sendRequest(formData);
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Obtenir les données du formulaire actuel
  const selectedRequest = getSelectedRequest();
  const formData = getCurrentFormData();

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
            requests={savedRequests}
            selectedRequestId={selectedRequestId}
            onSelectRequest={handleSelectRequest}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            favorites={favorites}
            recent={recent}
          />
          
          <RequestBuilder 
            selectedRequest={selectedRequest}
            formData={formData}
            onFormChange={handleFormChange}
            onSendRequest={handleSendRequest}
            isLoading={isLoading}
          />
          
          <ResponsePanel 
            response={response}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default BattpApp;