use std::fs;
use std::process::Command;
use tauri::{AppHandle, Manager};

use crate::models::ResumeData;

#[tauri::command]
pub async fn generate_latex(
    app_handle: AppHandle,
    resume_data_json: &str,
) -> Result<String, String> {
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
pub async fn save_latex_file(app_handle: AppHandle, resume_data_json: &str) -> Result<(), String> {
    // Generate the LaTeX content
    let latex_content = generate_latex(app_handle.clone(), resume_data_json).await?;

    // Use the dialog to save the file
    use tauri_plugin_dialog::{DialogExt, FilePath};

    let _file_path = app_handle
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

#[tauri::command]
pub async fn generate_pdf(app_handle: AppHandle, resume_data_json: &str) -> Result<(), String> {
    // 1. Generate LaTeX content
    let latex_content = generate_latex(app_handle.clone(), resume_data_json).await?;

    // 2. Get cache directory and create a temporary .tex file
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?;
    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    }
    let tex_file_path = cache_dir.join("resume.tex");
    fs::write(&tex_file_path, &latex_content).map_err(|e| e.to_string())?;

    // 3. Run pdflatex
    let output = Command::new("pdflatex")
        .arg("-interaction=nonstopmode")
        .arg(format!("-output-directory={}", cache_dir.to_str().unwrap()))
        .arg(tex_file_path.to_str().unwrap())
        .output()
        .map_err(|e| format!("Failed to execute pdflatex: {}. Make sure you have a TeX distribution installed and pdflatex is in your PATH.", e))?;

    if !output.status.success() {
        let error_log = fs::read_to_string(cache_dir.join("resume.log"))
            .unwrap_or_else(|_| "Could not read pdflatex log file.".to_string());
        return Err(format!(
            "pdflatex failed with status: {}.\nLog:\n{}",
            output.status, error_log
        ));
    }

    // 4. Use dialog to save the generated PDF
    let pdf_path = cache_dir.join("resume.pdf");
    if !pdf_path.exists() {
        return Err("PDF file was not generated.".to_string());
    }

    let pdf_data = fs::read(&pdf_path).map_err(|e| e.to_string())?;

    use tauri_plugin_dialog::DialogExt;
    app_handle
        .dialog()
        .file()
        .set_title("Save Resume as PDF")
        .add_filter("PDF files", &["pdf"])
        .set_file_name("resume.pdf")
        .save_file(move |file_path| {
            if let Some(path) = file_path {
                if let Some(path_ref) = path.as_path() {
                    if let Err(e) = fs::write(path_ref, &pdf_data) {
                        eprintln!("Failed to write PDF file: {}", e);
                    }
                }
            }
        });

    // 5. Clean up temporary files (optional, but good practice)
    let _ = fs::remove_file(cache_dir.join("resume.tex"));
    let _ = fs::remove_file(cache_dir.join("resume.aux"));
    let _ = fs::remove_file(cache_dir.join("resume.log"));
    let _ = fs::remove_file(cache_dir.join("resume.out"));
    let _ = fs::remove_file(cache_dir.join("resume.pdf"));

    Ok(())
}
