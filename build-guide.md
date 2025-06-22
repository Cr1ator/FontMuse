# 🔨 Полное руководство по сборке FontMuse

## 📋 Предварительные требования

### Базовые инструменты
```bash
# Node.js (версия 18 или выше)
node --version

# pnpm (рекомендуемый пакетный менеджер)
npm install -g pnpm

# Rust (последняя стабильная версия)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update stable
```

### Установка Tauri CLI
```bash
# Через cargo (рекомендуется)
cargo install tauri-cli --version 2.0.0-rc.18

# Или через npm
pnpm add -D @tauri-apps/cli@latest
```

## 🚀 Базовые команды сборки

### 1. Разработка
```bash
# Установить все зависимости
pnpm install

# Запустить в режиме разработки (hot reload)
pnpm tauri dev
# или
pnpm run build:dev
```

### 2. Обычная продакшн сборка
```bash
# Создает installer (.msi для Windows, .dmg для macOS, .deb/.appimage для Linux)
pnpm tauri build
# или
pnpm run build:prod
```

## 📦 Создание переносимых версий (Portable)

### Настройка конфигурации

1. **Создайте файл `src-tauri/tauri.portable.conf.json`** (используйте artifact выше)

2. **Обновите scripts в `package.json`** (используйте artifact выше)

### Команды для переносимых версий

#### Windows (запуск на Windows)
```bash
# Portable версия для Windows x64
pnpm run build:portable:windows

# Результат: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
# Файлы: FontMuse.exe (портативный исполняемый файл)
```

#### Linux (запуск на Linux или WSL)
```bash
# Portable версия для Linux x64
pnpm run build:portable:linux

# Результат: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/
# Файлы: 
# - appimage/FontMuse_0.1.0_amd64.AppImage (portable AppImage)
# - deb/FontMuse_0.1.0_amd64.deb (установщик)
```

#### macOS (запуск на macOS)
```bash
# Intel Macs
pnpm run build:portable:macos-intel

# Apple Silicon Macs
pnpm run build:portable:macos-arm

# Или оба сразу
pnpm run build:portable:macos

# Результат: src-tauri/target/{target}/release/bundle/macos/
# Файлы: FontMuse.app (portable app bundle)
```

#### Все платформы сразу
```bash
# Собрать portable версии для всех платформ
pnpm run build:portable

# ⚠️ ВНИМАНИЕ: Работает только если у вас настроена кроссплатформенная компиляция
```

## 🌍 Кроссплатформенная сборка

### Настройка кроссплатформенной компиляции

#### Для Windows разработчиков (сборка Linux/macOS)

**Linux target:**
```bash
# Добавить Linux target
rustup target add x86_64-unknown-linux-gnu

# Установить линкер (через WSL или Docker)
# Вариант 1: WSL2 с Ubuntu
wsl --install
# В WSL: sudo apt update && sudo apt install build-essential

# Вариант 2: Docker
# Используйте GitHub Actions (см. ниже)
```

**macOS target (сложно):**
```bash
# ⚠️ Кроссплатформенная сборка для macOS очень сложна
# Рекомендуется использовать GitHub Actions или реальный Mac
```

#### Для macOS разработчиков (сборка Windows/Linux)

**Windows target:**
```bash
# Добавить Windows target
rustup target add x86_64-pc-windows-msvc

# Установить зависимости через Homebrew
brew install mingw-w64
```

**Linux target:**
```bash
# Добавить Linux target  
rustup target add x86_64-unknown-linux-gnu

# Установить кроссплатформенный линкер
brew install FiloSottile/musl-cross/musl-cross
```

## 🎯 Создание GitHub Release

### Автоматическая сборка через GitHub Actions

Создайте файл `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: 'macos-latest'
            args: '--target aarch64-apple-darwin --config src-tauri/tauri.portable.conf.json'
          - platform: 'macos-latest' 
            args: '--target x86_64-apple-darwin --config src-tauri/tauri.portable.conf.json'
          - platform: 'ubuntu-20.04'
            args: '--target x86_64-unknown-linux-gnu --config src-tauri/tauri.portable.conf.json'
          - platform: 'windows-latest'
            args: '--target x86_64-pc-windows-msvc --config src-tauri/tauri.portable.conf.json'

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || matrix.platform == 'windows-latest' && 'x86_64-pc-windows-msvc' || 'x86_64-unknown-linux-gnu' }}

      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-20.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Install frontend dependencies
        run: pnpm install

      - name: Build the app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'FontMuse ${{ github.ref_name }}'
          releaseBody: 'See the assets to download and install this version.'
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}
```

### Ручная сборка для релиза

1. **Подготовка:**
```bash
# Обновить версию в Cargo.toml и tauri.conf.json
# Коммит изменений
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin v1.0.0
```

2. **Сборка всех версий:**
```bash
# Очистить предыдущие сборки
pnpm run clean

# Собрать все portable версии
pnpm run build:release
```

3. **Создание архивов для GitHub:**
```bash
# Windows
cd src-tauri/target/x86_64-pc-windows-msvc/release/
zip -r FontMuse-windows-portable.zip FontMuse.exe

# Linux (AppImage уже portable)
cd src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/
mv FontMuse_0.1.0_amd64.AppImage FontMuse-linux-portable.AppImage

# macOS
cd src-tauri/target/x86_64-apple-darwin/release/bundle/macos/
tar -czf FontMuse-macos-intel-portable.tar.gz FontMuse.app

cd ../../aarch64-apple-darwin/release/bundle/macos/
tar -czf FontMuse-macos-arm-portable.tar.gz FontMuse.app
```

4. **Загрузка на GitHub:**
   - Перейдите на https://github.com/ваш-пользователь/FontMuse/releases
   - Нажмите "Create a new release"
   - Выберите тег или создайте новый
   - Загрузите все созданные архивы
   - Опубликуйте релиз

## 🔧 Полезные команды для отладки

```bash
# Проверить доступные targets
rustup target list | grep installed

# Информация о сборке
tauri info

# Сборка с подробным выводом
tauri build --verbose

# Сборка только Rust части (без фронтенда)
cd src-tauri && cargo build --release

# Очистка кэша Rust
cargo clean

# Очистка кэша Node.js
pnpm store prune
```

## 📁 Структура выходных файлов

После сборки файлы будут находиться в:

```
src-tauri/target/
├── x86_64-pc-windows-msvc/release/
│   ├── FontMuse.exe                 # Portable исполняемый файл
│   └── bundle/
│       └── msi/FontMuse_0.1.0_x64.msi  # Установщик Windows
├── x86_64-unknown-linux-gnu/release/
│   └── bundle/
│       ├── appimage/FontMuse_0.1.0_amd64.AppImage  # Portable Linux
│       └── deb/FontMuse_0.1.0_amd64.deb           # Установщик Linux
└── x86_64-apple-darwin/release/
    └── bundle/
        ├── macos/FontMuse.app       # Portable macOS app
        └── dmg/FontMuse_0.1.0_x64.dmg  # Установщик macOS
```

## ⚠️ Важные заметки

1. **Размер файлов:** Portable версии могут быть больше установщиков
2. **Права доступа:** На macOS/Linux может потребоваться `chmod +x`
3. **Кодовая подпись:** Для распространения в App Store/Microsoft Store нужна подпись
4. **Зависимости:** Linux версия требует установленных системных библиотек
5. **Антивирус:** Windows Defender может блокировать неподписанные exe файлы

## 🆘 Решение проблем

### Проблема: "target not found"
```bash
rustup target add <target-name>
```

### Проблема: "linker not found" 
Установите соответствующие кроссплатформенные инструменты (см. выше)

### Проблема: "WebKit not found" (Linux)
```bash
sudo apt-get install libwebkit2gtk-4.0-dev
```

### Проблема: большой размер файла
Добавьте в Cargo.toml:
```toml
[profile.release]
opt-level = "s"  # Оптимизация по размеру
lto = true      # Link Time Optimization
strip = true    # Удаление отладочной информации
```