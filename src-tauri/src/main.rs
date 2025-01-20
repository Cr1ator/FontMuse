// src-tauri/src/main.rs
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::command;
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct FontInfo {
    name: String,
    path: String,
    is_system: bool,
}

#[command]
async fn get_system_fonts() -> Result<Vec<FontInfo>, String> {
    let mut fonts = Vec::new();
    
    // Windows system fonts directory
    if let Some(windir) = std::env::var_os("WINDIR") {
        let font_dir = PathBuf::from(windir).join("Fonts");
        
        if let Ok(entries) = fs::read_dir(&font_dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                if let Some(ext) = path.extension() {
                    if ext == "ttf" || ext == "otf" {
                        if let Some(name) = path.file_stem() {
                            let font_name = name.to_string_lossy().to_string();
                            fonts.push(FontInfo {
                                name: font_name,
                                path: path.to_string_lossy().to_string(),
                                is_system: true, // все шрифты в Windows/Fonts считаются системными
                            });
                        }
                    }
                }
            }
        }
    }
    
    // User fonts directory (Windows 10/11)
    if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        let user_font_dir = PathBuf::from(local_app_data)
            .join("Microsoft")
            .join("Windows")
            .join("Fonts");
            
        if let Ok(entries) = fs::read_dir(&user_font_dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                if let Some(ext) = path.extension() {
                    if ext == "ttf" || ext == "otf" {
                        if let Some(name) = path.file_stem() {
                            let font_name = name.to_string_lossy().to_string();
                            fonts.push(FontInfo {
                                name: font_name,
                                path: path.to_string_lossy().to_string(),
                                is_system: false, // пользовательские шрифты
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Сортируем шрифты по имени
    fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    
    Ok(fonts)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_system_fonts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}