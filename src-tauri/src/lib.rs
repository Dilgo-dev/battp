use std::collections::HashMap;
use std::time::Instant;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, send_http_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
