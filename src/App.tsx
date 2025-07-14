import { useState } from "react";
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [httpMethod, setHttpMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/users");
  const [activeTab, setActiveTab] = useState("headers");
  const [responseTab, setResponseTab] = useState("body");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const savedRequests = [
    {
      id: 1,
      name: "Get Users",
      method: "GET",
      url: "https://api.example.com/users",
      collection: "Gotham API",
      favorite: false,
    },
    {
      id: 2,
      name: "Create User",
      method: "POST",
      url: "https://api.example.com/users",
      collection: "Gotham API",
      favorite: false,
    },
    {
      id: 3,
      name: "Get Weather",
      method: "GET",
      url: "https://api.weather.com/current",
      collection: "External APIs",
      favorite: true,
    },
  ];

  const collections = [
    {
      name: "Gotham API",
      icon: "🦇",
      requests: ["Get Users", "Create User", "Update User"],
    },
    {
      name: "Wayne Enterprises",
      icon: "🏢",
      requests: ["Get Employees", "Payroll API"],
    },
  ];

  const favorites = savedRequests.filter((req) => req.favorite);
  const recent = savedRequests.slice(0, 3);

  const mockResponse = {
    status: 200,
    statusText: "OK",
    time: 245,
    size: "1.2KB",
    body: {
      users: [
        {
          id: 1,
          name: "Bruce Wayne",
          email: "bruce@wayneenterprises.com",
          role: "CEO",
        },
        {
          id: 2,
          name: "Alfred Pennyworth",
          email: "alfred@waynemanor.com",
          role: "Butler",
        },
      ],
      total: 2,
      page: 1,
    },
    headers: {
      "Content-Type": "application/json",
      Server: "nginx/1.18.0",
      "X-RateLimit-Remaining": "99",
      "X-Response-Time": "245ms",
    },
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
              <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-1">
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
              {/* Collections */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                  <Folder size={16} />
                  <span>Collections</span>
                </h3>
                <div className="space-y-1">
                  {collections.map((collection, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/10 cursor-pointer">
                        <FolderOpen
                          size={16}
                          className="text-accent-foreground"
                        />
                        <span className="text-sm text-foreground">
                          {collection.icon} {collection.name}
                        </span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {collection.requests.map((request, reqIndex) => (
                          <div
                            key={reqIndex}
                            className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent/10 cursor-pointer"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-foreground">
                              {request}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
              </h2>

              {/* URL Bar */}
              <div className="flex items-center space-x-2 mb-4">
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://api.example.com/endpoint"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2">
                  <Send size={16} />
                  <span>SEND</span>
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
                    <div className="space-y-2 text-sm font-mono">
                      <div>Content-Type: application/json</div>
                      <div>
                        Authorization: Bearer
                        eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
                      </div>
                      <div>X-API-Key: your-api-key-here</div>
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
                    <pre className="text-sm text-muted-foreground font-mono">{`{
  "name": "Dick Grayson",
  "email": "dick@wayneenterprises.com",
  "role": "Assistant"
}`}</pre>
                  </div>
                </div>
              )}

              {activeTab === "params" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    🔍 Query Params
                  </h3>
                  <div className="bg-card border border-border rounded-md p-4">
                    <div className="space-y-2 text-sm font-mono">
                      <div>page: 1</div>
                      <div>limit: 10</div>
                      <div>sort: name</div>
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
                <span
                  className={`text-sm font-medium ${getStatusColor(
                    mockResponse.status
                  )}`}
                >
                  Status: {mockResponse.status} {mockResponse.statusText} ✅
                </span>
                <span className="text-sm text-muted-foreground">
                  Time: {mockResponse.time}ms
                </span>
                <span className="text-sm text-muted-foreground">
                  Size: {mockResponse.size}
                </span>
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
                    <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                      {JSON.stringify(mockResponse.body, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {responseTab === "headers" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    🔍 Response Headers
                  </h3>
                  <div className="bg-muted border border-border rounded-md p-4">
                    <div className="space-y-2 text-sm font-mono">
                      {Object.entries(mockResponse.headers).map(
                        ([key, value]) => (
                          <div key={key} className="text-muted-foreground">
                            {key}: {value}
                          </div>
                        )
                      )}
                    </div>
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
