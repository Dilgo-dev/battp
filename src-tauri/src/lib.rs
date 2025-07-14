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

#[derive(Debug, Deserialize, Serialize)]
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

#[derive(Debug, Deserialize, Serialize)]
pub struct RequestsData {
    pub requests: Vec<SavedRequest>,
    pub selected_request_id: Option<i64>,
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

fn get_requests_file_path() -> Result<PathBuf, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Impossible d'obtenir le répertoire de données")?;
    
    let app_data_dir = data_dir.join("BATTP");
    
    // Créer le répertoire s'il n'existe pas
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Impossible de créer le répertoire: {}", e))?;
    }
    
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, send_http_request, save_requests, load_requests])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
