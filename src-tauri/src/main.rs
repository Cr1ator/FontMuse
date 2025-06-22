// src-tauri/src/main.rs

// Атрибут для скрытия консольного окна в релизной сборке на Windows.
// Для других систем или для отладки он не применяется.
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Serialize, Deserialize};
use std::path::PathBuf;

// --- Общая структура данных, доступная везде ---
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FontInfo {
    name: String,
    path: String,
    is_system: bool,
}

// --- Модуль с кодом, который будет компилироваться ТОЛЬКО для Windows ---
#[cfg(target_os = "windows")]
mod windows_api {
    use super::{FontInfo, PathBuf}; // Импортируем общие типы из родительской области видимости
    use std::fs;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Globalization::GetUserDefaultLCID;
    use windows::Win32::System::DataExchange::{
        CloseClipboard, GetClipboardData, IsClipboardFormatAvailable, OpenClipboard,
    };

    const CF_UNICODETEXT: u32 = 13;

    #[tauri::command]
    pub fn get_system_language() -> String {
        unsafe {
            let lcid = GetUserDefaultLCID();
            // 1049 - это LCID для русского языка
            if lcid == 1049 {
                "ru".to_string()
            } else {
                "en".to_string()
            }
        }
    }

    #[tauri::command]
    pub async fn get_selected_text() -> Result<String, String> {
        unsafe {
            if !IsClipboardFormatAvailable(CF_UNICODETEXT).as_bool() {
                return Ok(String::new()); // Если в буфере не текст, возвращаем пустую строку
            }

            if !OpenClipboard(HWND::default()).as_bool() {
                return Err("Не удалось открыть буфер обмена".into());
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

            CloseClipboard().ok();
            result
        }
    }

    #[tauri::command]
    pub async fn get_system_fonts() -> Result<Vec<FontInfo>, String> {
        let mut fonts = Vec::new();
        
        // Системные шрифты Windows
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
        
        // Пользовательские шрифты Windows
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
        
        fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        Ok(fonts)
    }

    fn process_font_entry(entry: fs::DirEntry, is_system: bool) -> Option<FontInfo> {
        let path = entry.path();
        if let Some(ext) = path.extension() {
            if ext == "ttf" || ext == "otf" {
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

// --- Модуль с кодом-заглушкой для macOS и Linux ---
#[cfg(not(target_os = "windows"))]
mod fallback {
    use super::FontInfo; // Импортируем общую структуру

    #[tauri::command]
    pub fn get_system_language() -> String {
        // Для macOS и Linux по умолчанию возвращаем "en".
        // В будущем можно добавить нативную логику для этих систем.
        "en".to_string()
    }

    #[tauri::command]
    pub async fn get_selected_text() -> Result<String, String> {
        // Функция-заглушка. На macOS/Linux мониторинг буфера пока не реализован.
        eprintln!("get_selected_text is not implemented for this OS yet.");
        Ok(String::new())
    }

    #[tauri::command]
    pub async fn get_system_fonts() -> Result<Vec<FontInfo>, String> {
        // Функция-заглушка. Возвращаем пустой список шрифтов.
        // TODO: Реализовать поиск шрифтов для macOS и Linux в стандартных директориях.
        eprintln!("get_system_fonts is not implemented for this OS yet.");
        Ok(Vec::new())
    }
}

fn main() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_fs::init());

    // В зависимости от операционной системы, регистрируем нужный набор команд
    #[cfg(target_os = "windows")]
    let app = builder.invoke_handler(tauri::generate_handler![
        windows_api::get_system_fonts,
        windows_api::get_selected_text,
        windows_api::get_system_language
    ]);

    #[cfg(not(target_os = "windows"))]
    let app = builder.invoke_handler(tauri::generate_handler![
        fallback::get_system_fonts,
        fallback::get_selected_text,
        fallback::get_system_language
    ]);

    app.run(tauri::generate_context!())
        .expect("error while running tauri application");
}