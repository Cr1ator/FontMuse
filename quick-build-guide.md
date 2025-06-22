# 🚀 Быстрая шпаргалка по сборке FontMuse

## ⚡ Самые важные команды

### Разработка
```bash
pnpm install           # Установить зависимости
pnpm tauri dev         # Запустить в режиме разработки
```

### Обычная сборка
```bash
pnpm tauri build       # Создать установщик (.msi/.dmg/.deb)
```

### Portable сборка (для GitHub releases)

#### Автоматически (рекомендуется)
```bash
# Linux/macOS
chmod +x build-release.sh
./build-release.sh

# Windows
powershell -ExecutionPolicy Bypass -File build-release.ps1
```

#### Вручную
```bash
# Подготовка
pnpm install
pnpm run build

# Windows portable
pnpm tauri build --target x86_64-pc-windows-msvc --config src-tauri/tauri.conf.json

# Linux portable  
pnpm tauri build --target x86_64-unknown-linux-gnu --config src-tauri/tauri.conf.json

# macOS portable (только на macOS)
pnpm tauri build --target x86_64-apple-darwin --config src-tauri/tauri.conf.json
pnpm tauri build --target aarch64-apple-darwin --config src-tauri/tauri.conf.json
```

## 📦 Готовые файлы для GitHub Release

После сборки файлы будут в:
- **Windows**: `src-tauri/target/x86_64-pc-windows-msvc/release/FontMuse.exe`
- **Linux**: `src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/*.AppImage`
- **macOS**: `src-tauri/target/*/release/bundle/macos/FontMuse.app`

## 🎯 Создание архивов для релиза

```bash
# Создать папку для релизов
mkdir releases

# Windows
cd src-tauri/target/x86_64-pc-windows-msvc/release/
zip -r ../../../../releases/FontMuse-windows-portable.zip FontMuse.exe

# Linux (AppImage уже готов)
cp src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/*.AppImage releases/FontMuse-linux-portable.AppImage

# macOS
cd src-tauri/target/x86_64-apple-darwin/release/bundle/macos/
tar -czf ../../../../../releases/FontMuse-macos-intel-portable.tar.gz FontMuse.app
```

## 🌍 Кроссплатформенная сборка

### На Windows (для Linux нужен WSL)
```bash
# Установить WSL2
wsl --install

# В WSL установить зависимости
sudo apt update && sudo apt install build-essential libgtk-3-dev libwebkit2gtk-4.0-dev

# Добавить Linux target
rustup target add x86_64-unknown-linux-gnu
```

### На macOS (можно собрать все платформы)
```bash
# Добавить targets
rustup target add x86_64-pc-windows-msvc x86_64-unknown-linux-gnu

# Установить кроссплатформенные инструменты
brew install mingw-w64
```

### GitHub Actions (самый простой способ)
Создайте файл `.github/workflows/release.yml` и пушьте тег:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 Решение проблем

### "target not found"
```bash
rustup target add <target-name>
```

### "WebKit not found" (Linux)
```bash
sudo apt-get install libwebkit2gtk-4.0-dev libgtk-3-dev
```

### Большой размер файла
Добавьте в `src-tauri/Cargo.toml`:
```toml
[profile.release]
opt-level = "s"
lto = true
strip = true
```

### Windows Defender блокирует .exe
- Подпишите файл цифровой подписью
- Или добавьте в исключения антивируса

## 📋 Чеклист для релиза

- [ ] Обновить версию в `Cargo.toml` и `tauri.conf.json`
- [ ] Протестировать сборку локально
- [ ] Создать архивы для всех платформ
- [ ] Создать GitHub release с описанием изменений
- [ ] Загрузить все архивы
- [ ] Протестировать загруженные файлы

## 🎉 Готово!

Ваши portable версии готовы для распространения через GitHub Releases!