use std::fs;
use std::io::Write;
use std::path::{Path};
use std::process::Command;
use tauri::{AppHandle, Manager, Window};
use tauri_plugin_dialog::{DialogExt, FilePath};
use tokio::sync::oneshot;

#[derive(serde::Deserialize, Clone)]
pub struct PersonalInfo {
    name: String,
    email: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String,
}

#[tauri::command]
pub async fn save_populated_latex(
    app: AppHandle,
    personal_info: PersonalInfo,
) -> Result<(), String> {
    // Resolve the path to the template file
    let resource_path = app
        .path()
        .resolve("template.tex", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve resource path: {}", e))?;

    let latex_template = fs::read_to_string(resource_path)
        .map_err(|e| format!("Failed to read template file: {}", e))?;

    let populated_latex = latex_template
        .replace("__NAME__", &personal_info.name)
        .replace("__EMAIL__", &personal_info.email)
        .replace("__LINKEDIN__", &personal_info.linkedin)
        .replace("__GITHUB__", &personal_info.github)
        .replace("__WEBSITE__", &personal_info.website)
        .replace("__SUMMARY__", &personal_info.summary);

    let result = tauri::async_runtime::spawn_blocking(move || {
        let file_path = app
            .dialog()
            .file()
            .add_filter("LaTeX File", &["tex"])
            .blocking_save_file();

        if let Some(path) = file_path {
            match path {
                FilePath::Path(path_buf) => {
                    let mut file = fs::File::create(&path_buf)
                        .map_err(|e| format!("Failed to create file at {:?}: {}", path_buf, e))?;
                    file.write_all(populated_latex.as_bytes())
                        .map_err(|e| format!("Failed to write to file: {}", e))?;
                }
                _ => return Err("Unsupported file path type".to_string()),
            }
        }
        Ok(())
    })
    .await;

    result.map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn generate_pdf(window: Window) -> Result<(), String> {
    let (tx, rx) = oneshot::channel();

    // Use the callback-based async dialog and bridge it to a future with a channel.
    window
        .dialog()
        .file()
        .add_filter("LaTeX", &["tex"])
        .set_title("Select a .tex file to compile")
        .pick_file(|path| {
            // We don't care if the receiver is dropped, so we ignore the result.
            let _ = tx.send(path);
        });

    // Await the file path from the channel.
    if let Some(file_path) = rx.await.map_err(|e| e.to_string())? {
        let path_buf = match file_path {
            FilePath::Path(p) => p,
            _ => return Err("Unsupported file path type.".to_string()),
        };

        // Offload the potentially slow, BLOCKING command to a background thread.
        tauri::async_runtime::spawn_blocking(move || run_pdflatex_blocking(&path_buf))
            .await
            .map_err(|e| format!("Task join error: {}", e))?
            .map_err(|e| format!("pdflatex execution error: {}", e))?;
    }

    // If user cancels dialog or something goes wrong with the channel, return Ok.
    Ok(())
}

/// A standard, synchronous function to run the command.
/// This will be executed on the blocking thread pool.
fn run_pdflatex_blocking(path: &Path) -> Result<(), String> {
    let parent_dir = path.parent().unwrap_or_else(|| Path::new("."));
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Failed to get file name.".to_string())?;

    let output = Command::new("pdflatex")
        .arg("-interaction=nonstopmode") // Crucial for preventing hangs
        .arg("-output-directory")
        .arg(parent_dir)
        .arg(file_name)
        .output()
        .map_err(|e| format!("Failed to run pdflatex. Is it in your PATH? Error: {}", e))?;

    if !output.status.success() {
        // Provide helpful feedback if compilation fails
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("pdflatex failed. Error: {}", stderr));
    }

    println!("PDF generated successfully!");
    Ok(())
}
