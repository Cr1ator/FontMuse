// src-tauri/src/main.rs

// Hide console window in release builds on Windows
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Serialize, Deserialize};
use std::path::PathBuf;

/// Common structure for font information across all platforms
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FontInfo {
    name: String,
    path: String,
    is_system: bool,
}

/// Windows-specific implementation using Windows APIs (updated for windows crate 0.58)
#[cfg(target_os = "windows")]
mod windows_api {
    use super::{FontInfo, PathBuf};
    use std::fs;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Globalization::GetUserDefaultLCID;
    use windows::Win32::System::DataExchange::{
        CloseClipboard, GetClipboardData, IsClipboardFormatAvailable, OpenClipboard,
    };

    const CF_UNICODETEXT: u32 = 13;

    /// Get system language based on Windows locale
    #[tauri::command]
    pub fn get_system_language() -> String {
        unsafe {
            let lcid = GetUserDefaultLCID();
            // 1049 is LCID for Russian language
            if lcid == 1049 {
                "ru".to_string()
            } else {
                "en".to_string()
            }
        }
    }

    /// Get currently selected text from Windows clipboard (updated for windows crate 0.58)
    #[tauri::command]
    pub async fn get_selected_text() -> Result<String, String> {
        unsafe {
            // Check if clipboard contains Unicode text
            // В новой версии IsClipboardFormatAvailable возвращает Result<(), Error>
            if IsClipboardFormatAvailable(CF_UNICODETEXT).is_err() {
                return Ok(String::new());
            }

            // Try to open clipboard
            // В новой версии OpenClipboard возвращает Result<(), Error>
            if let Err(_) = OpenClipboard(HWND::default()) {
                return Err("Failed to open clipboard".into());
            }

            let result = match GetClipboardData(CF_UNICODETEXT) {
                Ok(handle) if !handle.is_invalid() => {
                    let ptr = handle.0 as *const u16;
                    let len = (0..).take_while(|&i| *ptr.add(i) != 0).count();
                    let slice = std::slice::from_raw_parts(ptr, len);
                    Ok(String::from_utf16_lossy(slice))
                }
                _ => Ok(String::new()),
            };

            // Always close clipboard
            let _ = CloseClipboard();
            result
        }
    }

    /// Scan Windows system and user font directories
    #[tauri::command]
    pub async fn get_system_fonts() -> Result<Vec<FontInfo>, String> {
        let mut fonts = Vec::new();
        
        // System fonts from Windows directory
        if let Some(windir) = std::env::var_os("WINDIR") {
            let font_dir = PathBuf::from(windir).join("Fonts");
            if let Ok(entries) = fs::read_dir(&font_dir) {
                for entry in entries.filter_map(Result::ok) {
                    if let Some(font_info) = process_font_entry(entry, true) {
                        fonts.push(font_info);
                    }
                }
            }
        }
        
        // User fonts from local app data
        if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
            let user_font_dir = PathBuf::from(local_app_data).join("Microsoft\\Windows\\Fonts");
            if let Ok(entries) = fs::read_dir(&user_font_dir) {
                for entry in entries.filter_map(Result::ok) {
                    if let Some(font_info) = process_font_entry(entry, false) {
                        fonts.push(font_info);
                    }
                }
            }
        }
        
        // Sort fonts alphabetically (case-insensitive)
        fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        
        Ok(fonts)
    }

    /// Process individual font file entries
    fn process_font_entry(entry: fs::DirEntry, is_system: bool) -> Option<FontInfo> {
        let path = entry.path();
        
        // Only process TTF and OTF files
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if ext_str == "ttf" || ext_str == "otf" {
                if let Some(name) = path.file_stem() {
                    return Some(FontInfo {
                        name: name.to_string_lossy().to_string(),
                        path: path.to_string_lossy().to_string(),
                        is_system,
                    });
                }
            }
        }
        None
    }
}

/// macOS-specific implementation
#[cfg(target_os = "macos")]
mod macos_api {
    use super::FontInfo;
    use std::fs;

    #[tauri::command]
    pub fn get_system_language() -> String {
        // TODO: Implement proper macOS locale detection
        "en".to_string()
    }

    #[tauri::command]
    pub async fn get_selected_text() -> Result<String, String> {
        // TODO: Implement macOS clipboard monitoring
        Ok(String::new())
    }

    #[tauri::command]
    pub async fn get_system_fonts() -> Result<Vec<FontInfo>, String> {
        let mut fonts = Vec::new();
        
        // Standard macOS font directories
        let font_dirs = vec![
            "/System/Library/Fonts",
            "/Library/Fonts", 
            &format!("{}/Library/Fonts", std::env::var("HOME").unwrap_or_default()),
        ];

        for font_dir in font_dirs {
            let is_system = font_dir.starts_with("/System");
            if let Ok(entries) = fs::read_dir(font_dir) {
                for entry in entries.filter_map(Result::ok) {
                    if let Some(font_info) = process_font_entry(entry, is_system) {
                        fonts.push(font_info);
                    }
                }
            }
        }
        
        fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        Ok(fonts)
    }

    fn process_font_entry(entry: fs::DirEntry, is_system: bool) -> Option<FontInfo> {
        let path = entry.path();
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if ext_str == "ttf" || ext_str == "otf" {
                if let Some(name) = path.file_stem() {
                    return Some(FontInfo {
                        name: name.to_string_lossy().to_string(),
                        path: path.to_string_lossy().to_string(),
                        is_system,
                    });
                }
            }
        }
        None
    }
}

/// Linux-specific implementation
#[cfg(target_os = "linux")]
mod linux_api {
    use super::FontInfo;
    use std::fs;

    #[tauri::command]
    pub fn get_system_language() -> String {
        // TODO: Implement proper Linux locale detection
        "en".to_string()
    }

    #[tauri::command]
    pub async fn get_selected_text() -> Result<String, String> {
        // TODO: Implement Linux clipboard monitoring
        Ok(String::new())
    }

    #[tauri::command]
    pub async fn get_system_fonts() -> Result<Vec<FontInfo>, String> {
        let mut fonts = Vec::new();
        
        // Standard Linux font directories
        let font_dirs = vec![
            "/usr/share/fonts",
            "/usr/local/share/fonts",
            &format!("{}/.local/share/fonts", std::env::var("HOME").unwrap_or_default()),
            "/System/Fonts", // Some distributions
        ];

        for font_dir in font_dirs {
            let is_system = font_dir.starts_with("/usr") || font_dir.starts_with("/System");
            if let Ok(entries) = fs::read_dir(font_dir) {
                for entry in entries.filter_map(Result::ok) {
                    if let Some(font_info) = process_font_entry(entry, is_system) {
                        fonts.push(font_info);
                    }
                }
                
                // Recursively scan subdirectories
                scan_subdirectories(font_dir, is_system, &mut fonts);
            }
        }
        
        fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        Ok(fonts)
    }

    fn scan_subdirectories(dir: &str, is_system: bool, fonts: &mut Vec<FontInfo>) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.filter_map(Result::ok) {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(path_str) = path.to_str() {
                        scan_subdirectories(path_str, is_system, fonts);
                    }
                } else if let Some(font_info) = process_font_entry(entry, is_system) {
                    fonts.push(font_info);
                }
            }
        }
    }

    fn process_font_entry(entry: fs::DirEntry, is_system: bool) -> Option<FontInfo> {
        let path = entry.path();
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if ext_str == "ttf" || ext_str == "otf" {
                if let Some(name) = path.file_stem() {
                    return Some(FontInfo {
                        name: name.to_string_lossy().to_string(),
                        path: path.to_string_lossy().to_string(),
                        is_system,
                    });
                }
            }
        }
        None
    }
}

fn main() {
    let mut builder = tauri::Builder::default();

    // Add file system plugin
    builder = builder.plugin(tauri_plugin_fs::init());

    // Register platform-specific commands
    #[cfg(target_os = "windows")]
    {
        builder = builder.invoke_handler(tauri::generate_handler![
            windows_api::get_system_fonts,
            windows_api::get_selected_text,
            windows_api::get_system_language
        ]);
    }

    #[cfg(target_os = "macos")]
    {
        builder = builder.invoke_handler(tauri::generate_handler![
            macos_api::get_system_fonts,
            macos_api::get_selected_text,
            macos_api::get_system_language
        ]);
    }

    #[cfg(target_os = "linux")]
    {
        builder = builder.invoke_handler(tauri::generate_handler![
            linux_api::get_system_fonts,
            linux_api::get_selected_text,
            linux_api::get_system_language
        ]);
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}