use serde::{Deserialize, Serialize};
use tectonic::latex_to_pdf;
use tauri_plugin_sql::{Migration, MigrationKind};

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

#[derive(Serialize, Deserialize, Debug, Clone)]
struct VersionInfo {
    id: i64,
    name: String,
    created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FullVersion {
    id: i64,
    name: String,
    created_at: String,
    data: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn generate_pdf(resume_data_json: &str) -> Result<Vec<u8>, String> {
    let resume_data: ResumeData = serde_json::from_str(resume_data_json)
        .map_err(|e| format!("Failed to deserialize resume data: {}", e))?;

    let template = include_str!("../template.tex");

    let populated_template = template
        .replace("__USER_NAME__", &resume_data.personal_info.name)
        .replace("__USER_EMAIL__", &resume_data.personal_info.email)
        .replace("__USER_PHONE__", &resume_data.personal_info.phone)
        .replace("__USER_WEBSITE__", &resume_data.personal_info.website)
        .replace("__USER_SUMMARY__", &resume_data.personal_info.summary);

    let work_experience_entries = resume_data.work_experience.iter()
        .map(|exp| {
            format!(
                "\\item \\textbf{{{}}} at \\textbf{{{}}} \\hfill {} \\\\{}",
                exp.role, exp.company, exp.dates, exp.description
            )
        })
        .collect::<Vec<String>>()
        .join("\n");
    let populated_template = populated_template.replace("__WORK_EXPERIENCE_ENTRIES__", &work_experience_entries);

    let education_entries = resume_data.education.iter()
        .map(|edu| {
            format!(
                "\\item \\textbf{{{}}} at \\textbf{{{}}} \\hfill {} \\\\{}",
                edu.degree, edu.institution, edu.dates, edu.details
            )
        })
        .collect::<Vec<String>>()
        .join("\n");
    let populated_template = populated_template.replace("__EDUCATION_ENTRIES__", &education_entries);

    let skills_list = resume_data.skills.iter()
        .map(|skill| format!("\\texttt{{{}}}", skill.name))
        .collect::<Vec<String>>()
        .join(", ");
    let populated_template = populated_template.replace("__SKILLS_LIST__", &skills_list);

    let pdf_data = latex_to_pdf(populated_template)
        .map_err(|e| format!("Failed to compile LaTeX to PDF: {}", e))?;

    Ok(pdf_data)
}

#[tauri::command]
async fn save_version(
    db: tauri::State<'_, tauri_plugin_sql::Db>,
    name: String,
    data: String,
) -> Result<(), String> {
    db.execute(
        "INSERT INTO resume_versions (name, data) VALUES (?, ?)",
        &[&name, &data],
    )
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn load_versions(
    db: tauri::State<'_, tauri_plugin_sql::Db>,
) -> Result<Vec<VersionInfo>, String> {
    let versions = db
        .select("SELECT id, name, created_at FROM resume_versions ORDER BY created_at DESC", &[])
        .await
        .map_err(|e| e.to_string())?;
    Ok(versions)
}

#[tauri::command]
async fn load_version(
    db: tauri::State<'_, tauri_plugin_sql::Db>,
    id: i64,
) -> Result<FullVersion, String> {
    let version = db
        .select("SELECT id, name, created_at, data FROM resume_versions WHERE id = ?", &[id])
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .next()
        .ok_or_else(|| "Version not found".to_string())?;
    Ok(version)
}

#[tauri::command]
async fn delete_version(
    db: tauri::State<'_, tauri_plugin_sql::Db>,
    id: i64,
) -> Result<(), String> {
    db.execute("DELETE FROM resume_versions WHERE id = ?", &[id])
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_table",
            sql: "CREATE TABLE resume_versions (id INTEGER PRIMARY KEY, name TEXT, data TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:resume-data.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_pdf,
            save_version,
            load_versions,
            load_version,
            delete_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
