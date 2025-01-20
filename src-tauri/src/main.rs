use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use std::fs;
use windows::Win32::System::DataExchange::{
    GetClipboardData, OpenClipboard, CloseClipboard, 
    IsClipboardFormatAvailable
};
use windows::Win32::Foundation::HWND;

const CF_UNICODETEXT: u32 = 13; // Windows constant for Unicode text format

#[derive(Debug, Serialize, Deserialize)]
pub struct FontInfo {
    name: String,
    path: String,
    is_system: bool,
}

#[tauri::command]
async fn get_selected_text() -> Result<String, String> {
    unsafe {
        if !IsClipboardFormatAvailable(CF_UNICODETEXT).as_bool() {
            return Ok(String::new()); // Return empty string if no text available
        }

        if !OpenClipboard(HWND::default()).as_bool() {
            return Err("Failed to open clipboard".into());
        }

        let result = match GetClipboardData(CF_UNICODETEXT) {
            Ok(handle) => {
                let ptr = handle.0 as *const u16;
                let len = (0..).take_while(|&i| *ptr.offset(i) != 0).count();
                let slice = std::slice::from_raw_parts(ptr, len);
                let text = String::from_utf16_lossy(slice);
                Ok(text)
            }
            Err(_) => Ok(String::new()),
        };

        CloseClipboard().ok();
        result
    }
}

#[tauri::command]
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
                                is_system: true,
                            });
                        }
                    }
                }
            }
        }
    }
    
    // User fonts directory
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
                                is_system: false,
                            });
                        }
                    }
                }
            }
        }
    }
    
    fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    
    Ok(fonts)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_fonts,
            get_selected_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}