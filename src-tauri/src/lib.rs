// We've removed the SQL-related `use` statements
use comemo::Prehashed;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
// Add AppHandle to get access to the path resolver
use tauri::{AppHandle, Manager};
use typst::diag::{FileError, FileResult};
use typst::eval::Tracer;
use typst::foundations::{Bytes, Datetime, Smart};
use typst::syntax::{FileId, Source, VirtualPath};
use typst::text::{Font, FontBook};
use typst::{Library, World};

// The TypstWorld implementation remains the same
struct TypstWorld {
    library: Prehashed<Library>,
    book: Prehashed<FontBook>,
    fonts: Vec<Font>,
    source: Source,
}

impl TypstWorld {
    pub fn new(source: Source) -> Self {
        let lib = Library::default();
        let mut book = FontBook::new();
        let mut fonts = Vec::new();

        let font_paths = vec![std::path::Path::new("fonts")];
        for path in font_paths {
            if path.is_dir() {
                for entry in fs::read_dir(path).unwrap() {
                    let entry = entry.unwrap();
                    let path = entry.path();
                    if let Some(extension) = path.extension() {
                        if extension == "ttf" || extension == "otf" {
                            let font_bytes = fs::read(&path).unwrap();
                            let buffer = Bytes::from(font_bytes);
                            for font in Font::iter(buffer) {
                                book.push(font.info().clone());
                                fonts.push(font);
                            }
                        }
                    }
                }
            }
        }

        Self {
            library: Prehashed::new(lib),
            book: Prehashed::new(book),
            fonts,
            source,
        }
    }
}

impl World for TypstWorld {
    fn library(&self) -> &Prehashed<Library> {
        &self.library
    }
    fn book(&self) -> &Prehashed<FontBook> {
        &self.book
    }
    fn main(&self) -> Source {
        self.source.clone()
    }
    fn source(&self, _id: FileId) -> FileResult<Source> {
        Ok(self.source.clone())
    }
    fn file(&self, _id: FileId) -> FileResult<Bytes> {
        Err(FileError::NotFound(PathBuf::from("")))
    }
    fn font(&self, index: usize) -> Option<Font> {
        self.fonts.get(index).cloned()
    }
    fn today(&self, _offset: Option<i64>) -> Option<Datetime> {
        None
    }
}

// The resume data structs remain the same
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

// The `generate_pdf` command remains the same
#[tauri::command]
async fn generate_pdf(resume_data_json: &str) -> Result<Vec<u8>, String> {
    let resume_data: ResumeData = serde_json::from_str(resume_data_json)
        .map_err(|e| format!("Failed to deserialize resume data: {}", e))?;

    let mut typst_source = String::new();
    typst_source.push_str(&format!(
        "#set document(author: \"{}\")\n",
        resume_data.personal_info.name
    ));
    typst_source.push_str("#set text(font: \"Linux Libertine\")\n");
    typst_source.push_str(&format!(
        "#align(center)[#text(1.5em)[*{}*]]\n",
        resume_data.personal_info.name
    ));
    typst_source.push_str(&format!(
        "#align(center)[{}\n{} / {}\n]\n\n",
        resume_data.personal_info.email,
        resume_data.personal_info.phone,
        resume_data.personal_info.website
    ));
    typst_source.push_str(&format!("{}\n\n", resume_data.personal_info.summary));
    typst_source.push_str("== Work Experience\n");
    for exp in &resume_data.work_experience {
        typst_source.push_str(&format!(
            "[*{}*] at [*{}*] #h(1fr) [{}]\n",
            exp.role, exp.company, exp.dates
        ));
        typst_source.push_str(&format!("{}\n", exp.description));
    }
    typst_source.push_str("\n== Education\n");
    for edu in &resume_data.education {
        typst_source.push_str(&format!(
            "[*{}*] at [*{}*] #h(1fr) [{}]\n",
            edu.degree, edu.institution, edu.dates
        ));
        typst_source.push_str(&format!("{}\n", edu.details));
    }
    typst_source.push_str("\n== Skills\n");
    let skills_list = resume_data
        .skills
        .iter()
        .map(|skill| format!("#text(fill: blue)[{}]", skill.name))
        .collect::<Vec<String>>()
        .join(", ");
    typst_source.push_str(&skills_list);

    let main_fid = FileId::new(None, VirtualPath::new("/main.typ"));
    let source = Source::new(main_fid, typst_source);
    let world = TypstWorld::new(source);
    let mut tracer = Tracer::new();
    let document = typst::compile(&world, &mut tracer)
        .map_err(|errors| format!("Typst compilation failed: {:?}", errors))?;
    let pdf_data = typst_pdf::pdf(&document, Smart::Auto, None);

    Ok(pdf_data)
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
        // REMOVED: The SQL plugin is no longer initialized.
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_pdf,
            // ADDED: The new file-based commands are now handled.
            save_resume_data,
            load_resume_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
