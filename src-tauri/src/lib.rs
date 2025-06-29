use serde::{Deserialize, Serialize};
use std::fs;
// Add AppHandle to get access to the path resolver
use tauri::{AppHandle, Manager};

// Resume data structs
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PersonalInformation {
    name: String,
    email: String,
    phone: String,
    website: String,
    summary: String,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct WorkExperience {
    id: String,
    company: String,
    role: String,
    dates: String,
    description: String,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Education {
    id: String,
    institution: String,
    degree: String,
    dates: String,
    details: String,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Skill {
    id: String,
    name: String,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ResumeData {
    personal_info: PersonalInformation,
    work_experience: Vec<WorkExperience>,
    education: Vec<Education>,
    skills: Vec<Skill>,
}

// REMOVED: The database-related structs `VersionInfo` and `FullVersion` are gone.

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[tauri::command]
async fn generate_latex(app_handle: AppHandle, resume_data_json: &str) -> Result<String, String> {
    let resume_data: ResumeData = serde_json::from_str(resume_data_json)
        .map_err(|e| format!("Failed to deserialize resume data: {}", e))?;

    // Read the template file
    let template_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?
        .join("template.tex");

    let template_content = fs::read_to_string(&template_path)
        .map_err(|e| format!("Failed to read template file: {}", e))?;

    // Helper function to escape LaTeX special characters
    fn escape_latex(s: &str) -> String {
        s.replace('\\', "\\textbackslash{}")
            .replace('{', "\\{")
            .replace('}', "\\}")
            .replace('$', "\\$")
            .replace('&', "\\&")
            .replace('%', "\\%")
            .replace('#', "\\#")
            .replace('^', "\\textasciicircum{}")
            .replace('_', "\\_")
            .replace('~', "\\textasciitilde{}")
    }

    // Apply escaping to all user data
    let name = escape_latex(&resume_data.personal_info.name);
    let email = escape_latex(&resume_data.personal_info.email);
    let phone = escape_latex(&resume_data.personal_info.phone);
    let website = escape_latex(&resume_data.personal_info.website);
    let summary = escape_latex(&resume_data.personal_info.summary);

    // Generate education entries
    let education_entries = if resume_data.education.is_empty() {
        "\\item No education information available.".to_string()
    } else {
        resume_data
            .education
            .iter()
            .map(|edu| {
                let degree = escape_latex(&edu.degree);
                let institution = escape_latex(&edu.institution);
                let dates = escape_latex(&edu.dates);
                let details = escape_latex(&edu.details);

                if degree.trim().is_empty() && institution.trim().is_empty() {
                    return String::new();
                }

                let mut entry = format!("\\item \\textbf{{{}}}", degree);
                if !institution.trim().is_empty() && !degree.trim().is_empty() {
                    entry.push_str(&format!(" at \\textbf{{{}}}", institution));
                } else if !institution.trim().is_empty() {
                    entry = format!("\\item \\textbf{{{}}}", institution);
                }

                if !dates.trim().is_empty() {
                    entry.push_str(&format!(" \\hfill \\textit{{{}}}", dates));
                }

                if !details.trim().is_empty() {
                    entry.push_str(&format!("\n\\\\{}", details));
                }

                entry
            })
            .filter(|s| !s.is_empty())
            .collect::<Vec<String>>()
            .join("\n")
    };

    // Replace all placeholders in the template
    let latex_content = template_content
        .replace("REPLACENAME", &name)
        .replace("REPLACEEMAIL", &email)
        .replace("REPLACEPHONE", &phone)
        .replace("REPLACEWEBSITE", &website)
        .replace("REPLACESUMMARY", &summary)
        .replace("REPLACEEDUCATION", &education_entries);

    Ok(latex_content)
}

#[tauri::command]
async fn save_latex_file(app_handle: AppHandle, resume_data_json: &str) -> Result<(), String> {
    // Generate the LaTeX content
    let latex_content = generate_latex(app_handle.clone(), resume_data_json).await?;

    // Use the dialog to save the file
    use tauri_plugin_dialog::{DialogExt, FilePath};

    let file_path = app_handle
        .dialog()
        .file()
        .set_title("Save Resume as LaTeX")
        .add_filter("LaTeX files", &["tex"])
        .set_file_name("resume.tex")
        .save_file(move |file_path| {
            if let Some(path) = file_path {
                // Write the LaTeX content to the selected file
                if let Some(path_ref) = path.as_path() {
                    if let Err(e) = fs::write(path_ref, &latex_content) {
                        eprintln!("Failed to write LaTeX file: {}", e);
                    } else {
                        println!("LaTeX file saved to: {:?}", path_ref);
                    }
                }
            }
        });

    // Return success since the callback handles the file writing
    Ok(())
}

// NEW: Command to save the resume data to a file.
#[tauri::command]
async fn save_resume_data(app_handle: AppHandle, data: String) -> Result<(), String> {
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

// NEW: Command to load the resume data from a file.
#[tauri::command]
async fn load_resume_data(app_handle: AppHandle) -> Result<String, String> {
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

// REMOVED: All the database commands (`save_version`, `load_versions`, etc.) are gone.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // REMOVED: The `migrations` vector is gone.

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        // REMOVED: The SQL plugin is no longer initialized.
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_latex,
            save_latex_file,
            // ADDED: The new file-based commands are now handled.
            save_resume_data,
            load_resume_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
