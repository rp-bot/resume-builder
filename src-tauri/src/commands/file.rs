use std::fs;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn save_resume_data(app_handle: AppHandle, data: String) -> Result<(), String> {
    let path = app_handle
        .path()
        .app_data_dir()
        .or_else(|e| Err(e.to_string()))?;

    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;

    let file_path = path.join("resume.json");

    fs::write(file_path, data).map_err(|e| format!("Failed to write to file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn load_resume_data(app_handle: AppHandle) -> Result<String, String> {
    let path = app_handle
        .path()
        .app_data_dir()
        .or_else(|e| Err(e.to_string()))?;

    let file_path = path.join("resume.json");

    if file_path.exists() {
        fs::read_to_string(file_path).map_err(|e| format!("Failed to read file: {}", e))
    } else {
        Ok("{}".to_string())
    }
}

#[tauri::command]
pub async fn save_resume_to_file(file_path: String, data: String) -> Result<(), String> {
    fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write to file {}: {}", file_path, e))?;
    Ok(())
}

#[tauri::command]
pub async fn load_resume_from_file(file_path: String) -> Result<String, String> {
    if !std::path::Path::new(&file_path).exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file {}: {}", file_path, e))
}
