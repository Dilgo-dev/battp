import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Search,
  Plus,
  Download,
  Upload,
  Settings,
  Send,
  Copy,
  Save,
  RefreshCw,
  Star,
  Clock,
  Folder,
  FolderOpen,
  Trash2,
  FileText,
  Zap,
} from "lucide-react";

const BattpApp = () => {
  // États pour l'interface
  const [activeTab, setActiveTab] = useState("headers");
  const [responseTab, setResponseTab] = useState("body");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour la requête HTTP
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  
  // États pour la gestion des requêtes
  const [savedRequests, setSavedRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [httpMethod, setHttpMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState({
    "Content-Type": "application/json"
  });
  const [body, setBody] = useState('');
  const [params, setParams] = useState({});

  // Fonction pour créer une nouvelle requête
  const createNewRequest = () => {
    const newRequest = {
      id: Date.now(), // ID unique basé sur le timestamp
      name: "Untitled Request",
      method: "GET",
      url: "",
      headers: { "Content-Type": "application/json" },
      body: "",
      params: {},
      favorite: false,
      createdAt: new Date().toISOString(),
    };
    
    setSavedRequests(prev => [...prev, newRequest]);
    setSelectedRequestId(newRequest.id);
    
    // Charger la nouvelle requête dans l'interface
    setHttpMethod(newRequest.method);
    setUrl(newRequest.url);
    setHeaders(newRequest.headers);
    setBody(newRequest.body);
    setParams(newRequest.params);
  };

  // Fonction pour sélectionner une requête existante
  const selectRequest = (requestId) => {
    const request = savedRequests.find(req => req.id === requestId);
    if (request) {
      setSelectedRequestId(requestId);
      setHttpMethod(request.method);
      setUrl(request.url);
      setHeaders(request.headers);
      setBody(request.body);
      setParams(request.params);
    }
  };

  // Fonction pour sauvegarder automatiquement les modifications
  const updateSelectedRequest = (field, value) => {
    if (selectedRequestId) {
      setSavedRequests(prev => 
        prev.map(req => 
          req.id === selectedRequestId 
            ? { ...req, [field]: value }
            : req
        )
      );
    }
  };

  const favorites = savedRequests.filter((req) => req.favorite);
  const recent = savedRequests.slice(0, 3);

  // Fonction pour envoyer une requête HTTP
  const sendHttpRequest = async () => {
    // Vérifier que nous avons une requête sélectionnée et une URL
    if (!selectedRequestId || !url.trim()) {
      setError({ error: "Please select a request and enter a URL" });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Construire l'URL avec les paramètres de requête
      let finalUrl = url;
      if (httpMethod === "GET" && Object.keys(params).length > 0) {
        const urlObj = new URL(url);
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            urlObj.searchParams.append(key, value);
          }
        });
        finalUrl = urlObj.toString();
      }
      
      const requestData = {
        url: finalUrl,
        method: httpMethod,
        headers: headers,
        body: (httpMethod !== "GET" && body) ? body : null,
      };
      
      const result = await invoke("send_http_request", { request: requestData });
      setResponse(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour vérifier si le bouton SEND doit être désactivé
  const isSendDisabled = !selectedRequestId || !url.trim() || isLoading;

  // Fonction pour formater la taille en bytes
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Fonction pour formater le body JSON
  const formatResponseBody = (body) => {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "text-green-500";
      case "POST":
        return "text-blue-500";
      case "PUT":
        return "text-yellow-500";
      case "DELETE":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "text-success";
    if (status >= 400 && status < 500) return "text-warning";
    if (status >= 500) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🦇</div>
              <h1 className="text-2xl font-bold text-primary">BATTP</h1>
              <span className="text-sm text-muted-foreground">
                Batman API Client
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={createNewRequest}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>New Request</span>
              </button>
              <button className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1">
                <Upload size={16} />
                <span>Import</span>
              </button>
              <button className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1">
                <Download size={16} />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center space-x-1"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar - Saved Requests */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                <FileText size={20} />
                <span>SAVED REQUESTS</span>
              </h2>
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-muted-foreground"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Saved Requests */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                  <FileText size={16} />
                  <span>Saved Requests</span>
                </h3>
                <div className="space-y-1">
                  {savedRequests.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      No saved requests yet. Click "New Request" to create one.
                    </div>
                  ) : (
                    savedRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => selectRequest(request.id)}
                        className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer ${
                          selectedRequestId === request.id ? "bg-accent/20" : ""
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${getMethodColor(
                            request.method
                          )}`}
                        >
                          {request.method}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">
                            {request.name}
                          </div>
                          {request.url && (
                            <div className="text-xs text-muted-foreground truncate">
                              {request.url}
                            </div>
                          )}
                        </div>
                        {request.favorite && (
                          <Star
                            size={12}
                            className="text-accent-foreground fill-current"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Favorites */}
              <div className="p-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                  <Star size={16} />
                  <span>Favorites</span>
                </h3>
                <div className="space-y-1">
                  {favorites.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
                    >
                      <Star
                        size={14}
                        className="text-accent-foreground fill-current"
                      />
                      <span className="text-sm text-foreground">
                        {request.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent */}
              <div className="p-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Recent</span>
                </h3>
                <div className="space-y-1">
                  {recent.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer"
                    >
                      <span
                        className={`text-xs font-medium ${getMethodColor(
                          request.method
                        )}`}
                      >
                        {request.method}
                      </span>
                      <span className="text-sm text-foreground truncate">
                        {request.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Request Builder */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Zap size={20} className="text-accent" />
                <span>REQUEST BUILDER</span>
                {selectedRequestId && (
                  <span className="text-sm text-muted-foreground">
                    - {savedRequests.find(r => r.id === selectedRequestId)?.name}
                  </span>
                )}
              </h2>
              
              {!selectedRequestId && (
                <div className="mb-4 p-3 bg-muted border border-border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    📝 Please create a new request or select an existing one to get started.
                  </p>
                </div>
              )}

              {/* URL Bar */}
              <div className="flex items-center space-x-2 mb-4">
                <select
                  value={httpMethod}
                  onChange={(e) => {
                    setHttpMethod(e.target.value);
                    updateSelectedRequest('method', e.target.value);
                  }}
                  disabled={!selectedRequestId}
                  className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    updateSelectedRequest('url', e.target.value);
                  }}
                  disabled={!selectedRequestId}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  placeholder="https://api.example.com/endpoint"
                />
                <button 
                  onClick={sendHttpRequest}
                  disabled={isSendDisabled}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  <span>{isLoading ? "SENDING..." : "SEND"}</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-4">
                {["headers", "body", "params"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${
                      activeTab === tab
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4">
              {activeTab === "headers" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    🔧 Headers
                  </h3>
                  <div className="bg-card border border-border rounded-md p-4">
                    <div className="space-y-3">
                      {Object.entries(headers).map(([key, value]) => (
                        <div key={key} className="flex space-x-2">
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => {
                              const newHeaders = { ...headers };
                              delete newHeaders[key];
                              newHeaders[e.target.value] = value;
                              setHeaders(newHeaders);
                              updateSelectedRequest('headers', newHeaders);
                            }}
                            disabled={!selectedRequestId}
                            className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                            placeholder="Header name"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newHeaders = { ...headers, [key]: e.target.value };
                              setHeaders(newHeaders);
                              updateSelectedRequest('headers', newHeaders);
                            }}
                            disabled={!selectedRequestId}
                            className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                            placeholder="Header value"
                          />
                          <button
                            onClick={() => {
                              const newHeaders = { ...headers };
                              delete newHeaders[key];
                              setHeaders(newHeaders);
                              updateSelectedRequest('headers', newHeaders);
                            }}
                            disabled={!selectedRequestId}
                            className="px-2 py-1 text-red-500 hover:bg-red-500/10 rounded disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newHeaders = { ...headers, "": "" };
                          setHeaders(newHeaders);
                          updateSelectedRequest('headers', newHeaders);
                        }}
                        disabled={!selectedRequestId}
                        className="w-full px-2 py-1 border border-dashed border-border rounded text-sm text-muted-foreground hover:border-primary disabled:opacity-50"
                      >
                        + Add Header
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "body" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    📦 Body
                  </h3>
                  <div className="bg-card border border-border rounded-md p-4">
                    <textarea
                      value={body}
                      onChange={(e) => {
                        setBody(e.target.value);
                        updateSelectedRequest('body', e.target.value);
                      }}
                      disabled={!selectedRequestId}
                      className="w-full h-48 px-3 py-2 bg-input border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                      placeholder="Enter request body (JSON, XML, etc.)"
                    />
                  </div>
                </div>
              )}

              {activeTab === "params" && (
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
                            onChange={(e) => {
                              const newParams = { ...params };
                              delete newParams[key];
                              newParams[e.target.value] = value;
                              setParams(newParams);
                              updateSelectedRequest('params', newParams);
                            }}
                            disabled={!selectedRequestId}
                            className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                            placeholder="Parameter name"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newParams = { ...params, [key]: e.target.value };
                              setParams(newParams);
                              updateSelectedRequest('params', newParams);
                            }}
                            disabled={!selectedRequestId}
                            className="flex-1 px-2 py-1 bg-input border border-border rounded text-sm disabled:opacity-50"
                            placeholder="Parameter value"
                          />
                          <button
                            onClick={() => {
                              const newParams = { ...params };
                              delete newParams[key];
                              setParams(newParams);
                              updateSelectedRequest('params', newParams);
                            }}
                            disabled={!selectedRequestId}
                            className="px-2 py-1 text-red-500 hover:bg-red-500/10 rounded disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newParams = { ...params, "": "" };
                          setParams(newParams);
                          updateSelectedRequest('params', newParams);
                        }}
                        disabled={!selectedRequestId}
                        className="w-full px-2 py-1 border border-dashed border-border rounded text-sm text-muted-foreground hover:border-primary disabled:opacity-50"
                      >
                        + Add Parameter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Response */}
          <div className="w-96 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                <FileText size={20} />
                <span>RESPONSE</span>
              </h2>

              {/* Status */}
              <div className="flex items-center space-x-4 mb-4">
                {isLoading && (
                  <span className="text-sm font-medium text-muted-foreground">
                    Loading...
                  </span>
                )}
                {error && (
                  <span className="text-sm font-medium text-destructive">
                    Error: {error.error || error.message}
                  </span>
                )}
                {response && (
                  <>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        response.status
                      )}`}
                    >
                      Status: {response.status} {response.status_text} {response.status >= 200 && response.status < 300 ? "✅" : "❌"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Time: {response.time_ms}ms
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Size: {formatSize(response.size)}
                    </span>
                  </>
                )}
              </div>

              {/* Response Tabs */}
              <div className="flex space-x-1 mb-4">
                {["body", "headers"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResponseTab(tab)}
                    className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
                      responseTab === tab
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {responseTab === "body" && (
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
              )}

              {responseTab === "headers" && (
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
                        {Object.entries(response.headers).map(
                          ([key, value]) => (
                            <div key={key} className="text-muted-foreground">
                              {key}: {value}
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {!isLoading && !error && !response && (
                      <div className="text-sm text-muted-foreground">
                        No response yet. Click SEND to make a request.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Response Actions */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center space-x-2">
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center space-x-2">
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 flex items-center justify-center space-x-2">
                  <RefreshCw size={16} />
                  <span>Format</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattpApp;
