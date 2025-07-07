use std::fs;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn save_resume_data(app_handle: AppHandle, data: String) -> Result<(), String> {
    // Get the path to the app's data directory
    let path = app_handle
        .path()
        .app_data_dir()
        .or_else(|e| Err(e.to_string()))?;

    // Create the directory if it doesn't exist
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;

    // Define the file path
    let file_path = path.join("resume.json");

    // Write the data to the file
    fs::write(file_path, data).map_err(|e| format!("Failed to write to file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn load_resume_data(app_handle: AppHandle) -> Result<String, String> {
    // Get the path to the app's data directory
    let path = app_handle
        .path()
        .app_data_dir()
        .or_else(|e| Err(e.to_string()))?;

    let file_path = path.join("resume.json");

    // Check if the file exists
    if file_path.exists() {
        // Read the file content and return it
        fs::read_to_string(file_path).map_err(|e| format!("Failed to read file: {}", e))
    } else {
        // If the file doesn't exist, return an empty JSON object string.
        // This gives the frontend a valid default state on first run.
        Ok("{}".to_string())
    }
}
