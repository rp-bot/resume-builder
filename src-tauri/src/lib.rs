pub mod commands;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::resume::save_populated_latex,
            commands::resume::save_populated_temp_latex,
            commands::resume::refresh_temp_view,
            commands::resume::get_temp_pdf_data,
            commands::resume::generate_pdf,
            commands::file::save_resume_data,
            commands::file::load_resume_data,
            commands::file::save_resume_to_file,
            commands::file::load_resume_from_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
