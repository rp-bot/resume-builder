use std::fs;
use std::io::Write;
use std::path::Path;
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

#[derive(serde::Deserialize, Clone)]
pub struct Education {
    school: String,
    location: String,
    date: String,
    degree: String,
    coursework: String,
}

#[derive(serde::Deserialize, Clone)]
pub struct SkillCategory {
    name: String,
    skills: String,
}

#[tauri::command]
pub async fn save_populated_latex(
    app: AppHandle,
    personal_info: PersonalInfo,
    education: Vec<Education>,
    skills: Vec<SkillCategory>,
) -> Result<(), String> {
    // Resolve the path to the template file
    let resource_path = app
        .path()
        .resolve("template.tex", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve resource path: {}", e))?;

    let latex_template = fs::read_to_string(resource_path)
        .map_err(|e| format!("Failed to read template file: {}", e))?;

    // Generate LaTeX string for education items from the provided data
    let education_latex = if education.is_empty() {
        "% No education entries provided".to_string()
    } else {
        education
            .iter()
            .map(|edu| {
                format!(
                    "\\resumeEducationHeading\n      {{{}}}{{{} $|$ {}}}\n      {{{}\\footnotesize{{}}}}{{\\textbf{{Relevant Coursework:}} {}}}",
                    edu.school,
                    edu.location,
                    edu.date,
                    edu.degree,
                    edu.coursework
                )
            })
            .collect::<Vec<String>>()
            .join("\n    ")
    };

    // Generate LaTeX string for skills from the provided data
    let skills_latex = if skills.is_empty() {
        "% No skills entries provided".to_string()
    } else {
        skills
            .iter()
            .enumerate()
            .map(|(index, skill)| {
                let separator = if index == skills.len() - 1 {
                    "" // No [2pt] for the last item
                } else {
                    "\\\\[2pt]" // Add [2pt] for all other items
                };

                // Convert markdown bold (**word**) to LaTeX bold (\textbf{word})
                let converted_skills = skill
                    .skills
                    .split("**")
                    .enumerate()
                    .map(|(i, part)| {
                        if i % 2 == 1 {
                            // This is inside **bold** tags
                            format!("\\textbf{{{}}}", part)
                        } else {
                            // This is regular text
                            part.to_string()
                        }
                    })
                    .collect::<String>();

                format!(
                    "\\textbf{{{}:}} {}{}",
                    skill.name, converted_skills, separator
                )
            })
            .collect::<Vec<String>>()
            .join("\n      ")
    };

    let populated_latex = latex_template
        .replace("__NAME__", &personal_info.name)
        .replace("__EMAIL__", &personal_info.email)
        .replace("__LINKEDIN__", &personal_info.linkedin)
        .replace("__GITHUB__", &personal_info.github)
        .replace("__WEBSITE__", &personal_info.website)
        .replace("__SUMMARY__", &personal_info.summary)
        .replace("__EDUCATION_LIST_ITEM__", &education_latex)
        .replace("__SKILLS__", &skills_latex);

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
    let (tx_input, rx_input) = oneshot::channel();

    // First dialog: Select input .tex file
    window
        .dialog()
        .file()
        .add_filter("LaTeX", &["tex"])
        .set_title("Select a .tex file to compile")
        .pick_file(|path| {
            let _ = tx_input.send(path);
        });

    // Await the input file path from the channel.
    if let Some(input_file_path) = rx_input.await.map_err(|e| e.to_string())? {
        let input_path_buf = match input_file_path {
            FilePath::Path(p) => p,
            _ => return Err("Unsupported file path type.".to_string()),
        };

        // Second dialog: Select output directory
        let (tx_output, rx_output) = oneshot::channel();

        window
            .dialog()
            .file()
            .set_title("Select directory to save PDF")
            .pick_folder(|path| {
                let _ = tx_output.send(path);
            });

        // Await the output directory path from the channel.
        if let Some(output_dir_path) = rx_output.await.map_err(|e| e.to_string())? {
            let output_path_buf = match output_dir_path {
                FilePath::Path(p) => p,
                _ => return Err("Unsupported file path type.".to_string()),
            };

            // Offload the potentially slow, BLOCKING command to a background thread.
            tauri::async_runtime::spawn_blocking(move || {
                run_pdflatex_blocking(&input_path_buf, &output_path_buf)
            })
            .await
            .map_err(|e| format!("Task join error: {}", e))?
            .map_err(|e| format!("pdflatex execution error: {}", e))?;
        }
    }

    // If user cancels dialog or something goes wrong with the channel, return Ok.
    Ok(())
}

/// A standard, synchronous function to run the command.
/// This will be executed on the blocking thread pool.
fn run_pdflatex_blocking(input_path: &Path, output_dir: &Path) -> Result<(), String> {
    // let file_name = input_path
    //     .file_name()
    //     .and_then(|name| name.to_str())
    //     .ok_or_else(|| "Failed to get file name.".to_string())?;

    // Change to the directory containing the input file so relative paths work
    let input_dir = input_path.parent().unwrap_or_else(|| Path::new("."));

    let output = Command::new("pdflatex")
        .arg("-interaction=nonstopmode") // Crucial for preventing hangs
        .arg("-output-directory")
        .arg(output_dir)
        .arg(input_path)
        .current_dir(input_dir)
        .output()
        .map_err(|e| format!("Failed to run pdflatex. Is it in your PATH? Error: {}", e))?;

    if !output.status.success() {
        // Provide helpful feedback if compilation fails
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("pdflatex failed. Error: {}", stderr));
    }

    println!("PDF generated successfully in {:?}!", output_dir);
    Ok(())
}
