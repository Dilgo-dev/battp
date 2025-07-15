use std::collections::HashMap;
use std::time::Instant;
use std::path::PathBuf;
use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct HttpRequest {
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub time_ms: u128,
    pub size: usize,
}

#[derive(Debug, Serialize)]
pub struct HttpError {
    pub error: String,
    pub details: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SavedRequest {
    pub id: i64,
    pub name: String,
    pub method: String,
    pub url: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub params: HashMap<String, String>,
    pub favorite: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RequestsData {
    pub requests: Vec<SavedRequest>,
    pub selected_request_id: Option<i64>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub sync_path: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct WorkspaceData {
    pub workspaces: Vec<Workspace>,
    pub current_workspace_id: String,
    pub requests_by_workspace: HashMap<String, Vec<SavedRequest>>,
    pub selected_request_id_by_workspace: HashMap<String, Option<i64>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct WorkspaceFile {
    pub name: String,
    pub requests: Vec<SavedRequest>,
    pub selected_request_id: Option<i64>,
    pub created_at: String,
    pub version: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn send_http_request(request: HttpRequest) -> Result<HttpResponse, HttpError> {
    let start_time = Instant::now();
    
    let client = reqwest::Client::new();
    
    // Créer la requête selon la méthode HTTP
    let mut req_builder = match request.method.to_uppercase().as_str() {
        "GET" => client.get(&request.url),
        "POST" => client.post(&request.url),
        "PUT" => client.put(&request.url),
        "DELETE" => client.delete(&request.url),
        "PATCH" => client.patch(&request.url),
        _ => return Err(HttpError {
            error: "Méthode HTTP non supportée".to_string(),
            details: Some(format!("Méthode: {}", request.method)),
        }),
    };
    
    // Ajouter les headers
    for (key, value) in request.headers.iter() {
        req_builder = req_builder.header(key, value);
    }
    
    // Ajouter le body si présent
    if let Some(body) = request.body {
        if !body.is_empty() {
            req_builder = req_builder.body(body);
        }
    }
    
    // Envoyer la requête
    match req_builder.send().await {
        Ok(response) => {
            let status = response.status().as_u16();
            let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();
            
            // Extraire les headers
            let mut headers = HashMap::new();
            for (key, value) in response.headers().iter() {
                headers.insert(
                    key.to_string(),
                    value.to_str().unwrap_or("").to_string(),
                );
            }
            
            // Lire le body
            let body = response.text().await.map_err(|e| HttpError {
                error: "Erreur lors de la lecture du body".to_string(),
                details: Some(e.to_string()),
            })?;
            
            let time_ms = start_time.elapsed().as_millis();
            let size = body.len();
            
            Ok(HttpResponse {
                status,
                status_text,
                headers,
                body,
                time_ms,
                size,
            })
        }
        Err(e) => Err(HttpError {
            error: "Erreur lors de l'envoi de la requête".to_string(),
            details: Some(e.to_string()),
        }),
    }
}

fn get_app_data_dir() -> Result<PathBuf, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Impossible d'obtenir le répertoire de données")?;
    
    let app_data_dir = data_dir.join("BATHTTP");
    
    // Créer le répertoire s'il n'existe pas
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Impossible de créer le répertoire: {}", e))?;
    }
    
    Ok(app_data_dir)
}

fn get_workspaces_file_path() -> Result<PathBuf, String> {
    let app_data_dir = get_app_data_dir()?;
    Ok(app_data_dir.join("workspaces.json"))
}

fn get_requests_file_path() -> Result<PathBuf, String> {
    let app_data_dir = get_app_data_dir()?;
    Ok(app_data_dir.join("requests.json"))
}

#[tauri::command]
async fn save_requests(requests_data: RequestsData) -> Result<(), String> {
    let file_path = get_requests_file_path()?;
    
    let json_content = serde_json::to_string_pretty(&requests_data)
        .map_err(|e| format!("Erreur de sérialisation: {}", e))?;
    
    fs::write(&file_path, json_content)
        .map_err(|e| format!("Impossible d'écrire le fichier: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn load_requests() -> Result<RequestsData, String> {
    let file_path = get_requests_file_path()?;
    
    if !file_path.exists() {
        // Si le fichier n'existe pas, retourner des données vides
        return Ok(RequestsData {
            requests: Vec::new(),
            selected_request_id: None,
        });
    }
    
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Impossible de lire le fichier: {}", e))?;
    
    let requests_data: RequestsData = serde_json::from_str(&content)
        .map_err(|e| format!("Erreur de désérialisation: {}", e))?;
    
    Ok(requests_data)
}

#[tauri::command]
async fn load_workspaces() -> Result<WorkspaceData, String> {
    let file_path = get_workspaces_file_path()?;
    
    if !file_path.exists() {
        // Si le fichier n'existe pas, créer un workspace par défaut
        let default_workspace = Workspace {
            id: "default".to_string(),
            name: "Mon Workspace".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            sync_path: None,
        };
        
        let workspace_data = WorkspaceData {
            workspaces: vec![default_workspace],
            current_workspace_id: "default".to_string(),
            requests_by_workspace: HashMap::new(),
            selected_request_id_by_workspace: HashMap::new(),
        };
        
        // Sauvegarder le workspace par défaut
        save_workspaces(workspace_data.clone()).await?;
        
        return Ok(workspace_data);
    }
    
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Impossible de lire le fichier: {}", e))?;
    
    let workspace_data: WorkspaceData = serde_json::from_str(&content)
        .map_err(|e| format!("Erreur de désérialisation: {}", e))?;
    
    Ok(workspace_data)
}

#[tauri::command]
async fn save_workspaces(workspace_data: WorkspaceData) -> Result<(), String> {
    let file_path = get_workspaces_file_path()?;
    
    let json_content = serde_json::to_string_pretty(&workspace_data)
        .map_err(|e| format!("Erreur de sérialisation: {}", e))?;
    
    fs::write(&file_path, json_content)
        .map_err(|e| format!("Impossible d'écrire le fichier: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn create_workspace(name: String) -> Result<Workspace, String> {
    let workspace_id = uuid::Uuid::new_v4().to_string();
    
    let workspace = Workspace {
        id: workspace_id,
        name,
        created_at: chrono::Utc::now().to_rfc3339(),
        sync_path: None,
    };
    
    Ok(workspace)
}

#[tauri::command]
async fn create_workspace_with_path(name: String, sync_path: Option<String>) -> Result<Workspace, String> {
    let workspace_id = uuid::Uuid::new_v4().to_string();
    
    // Si un chemin est fourni, vérifier s'il contient déjà un workspace
    if let Some(path) = &sync_path {
        let workspace_file_path = PathBuf::from(path).join("workspace.json");
        if workspace_file_path.exists() {
            // Importer le workspace existant
            return import_workspace_from_path(path.clone()).await;
        }
    }
    
    let workspace = Workspace {
        id: workspace_id,
        name,
        created_at: chrono::Utc::now().to_rfc3339(),
        sync_path,
    };
    
    // Si un chemin est fourni, sauvegarder le workspace dans ce chemin
    if let Some(path) = &workspace.sync_path {
        sync_workspace_to_path(workspace.clone(), vec![], None, path.clone()).await?;
    }
    
    Ok(workspace)
}

#[tauri::command]
async fn import_workspace_from_path(path: String) -> Result<Workspace, String> {
    let workspace_file_path = PathBuf::from(&path).join("workspace.json");
    
    if !workspace_file_path.exists() {
        return Err("Aucun workspace trouvé dans ce chemin".to_string());
    }
    
    let content = fs::read_to_string(&workspace_file_path)
        .map_err(|e| format!("Impossible de lire le fichier workspace: {}", e))?;
    
    let workspace_file: WorkspaceFile = serde_json::from_str(&content)
        .map_err(|e| format!("Erreur de désérialisation du workspace: {}", e))?;
    
    let workspace = Workspace {
        id: uuid::Uuid::new_v4().to_string(),
        name: workspace_file.name,
        created_at: workspace_file.created_at,
        sync_path: Some(path),
    };
    
    Ok(workspace)
}

#[tauri::command]
async fn sync_workspace_to_path(
    workspace: Workspace,
    requests: Vec<SavedRequest>,
    selected_request_id: Option<i64>,
    path: String,
) -> Result<(), String> {
    let workspace_file_path = PathBuf::from(&path).join("workspace.json");
    
    // Créer le répertoire s'il n'existe pas
    if let Some(parent) = workspace_file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Impossible de créer le répertoire: {}", e))?;
    }
    
    let workspace_file = WorkspaceFile {
        name: workspace.name.clone(),
        requests: requests,
        selected_request_id,
        created_at: workspace.created_at.clone(),
        version: "1.0.0".to_string(),
    };
    
    let json_content = serde_json::to_string_pretty(&workspace_file)
        .map_err(|e| format!("Erreur de sérialisation: {}", e))?;
    
    fs::write(&workspace_file_path, json_content)
        .map_err(|e| format!("Impossible d'écrire le fichier: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn check_workspace_exists_at_path(path: String) -> Result<bool, String> {
    let workspace_file_path = PathBuf::from(path).join("workspace.json");
    Ok(workspace_file_path.exists())
}

#[tauri::command]
async fn delete_workspace(workspace_id: String) -> Result<(), String> {
    // Vérifier que ce n'est pas le workspace par défaut
    if workspace_id == "default" {
        return Err("Impossible de supprimer le workspace par défaut".to_string());
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            send_http_request, 
            save_requests, 
            load_requests,
            load_workspaces,
            save_workspaces,
            create_workspace,
            create_workspace_with_path,
            import_workspace_from_path,
            sync_workspace_to_path,
            check_workspace_exists_at_path,
            delete_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
