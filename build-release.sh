#!/bin/bash

# FontMuse Release Build Script
# Автоматически собирает portable версии для всех платформ

set -e  # Выйти при любой ошибке

echo "🚀 FontMuse Release Build Script"
echo "================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка зависимостей
check_dependencies() {
    log "Проверка зависимостей..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js не установлен"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        error "pnpm не установлен. Установите: npm install -g pnpm"
        exit 1
    fi
    
    if ! command -v cargo &> /dev/null; then
        error "Rust не установлен"
        exit 1
    fi
    
    if ! command -v tauri &> /dev/null; then
        error "Tauri CLI не установлен. Установите: cargo install tauri-cli"
        exit 1
    fi
    
    log "Все зависимости найдены ✓"
}

# Очистка предыдущих сборок
clean_build() {
    log "Очистка предыдущих сборок..."
    rm -rf src-tauri/target/release/
    rm -rf out/
    rm -rf dist/
    rm -rf releases/
    log "Очистка завершена ✓"
}

# Установка зависимостей
install_deps() {
    log "Установка зависимостей..."
    pnpm install
    log "Зависимости установлены ✓"
}

# Сборка фронтенда
build_frontend() {
    log "Сборка фронтенда..."
    pnpm run build
    log "Фронтенд собран ✓"
}

# Функция сборки для конкретной платформы
build_platform() {
    local platform=$1
    local target=$2
    local display_name=$3
    
    log "Сборка для $display_name ($target)..."
    
    # Проверяем, установлен ли target
    if ! rustup target list --installed | grep -q "$target"; then
        log "Установка target $target..."
        rustup target add "$target" || {
            warn "Не удалось установить target $target. Пропускаем..."
            return 1
        }
    fi
    
    # Сборка
    if tauri build --target "$target" --config src-tauri/tauri.portable.conf.json; then
        log "Сборка для $display_name завершена ✓"
        return 0
    else
        warn "Сборка для $display_name не удалась"
        return 1
    fi
}

# Создание архивов
create_archives() {
    log "Создание архивов для релиза..."
    
    mkdir -p releases/
    
    # Windows
    if [ -f "src-tauri/target/x86_64-pc-windows-msvc/release/FontMuse.exe" ]; then
        log "Создание Windows portable архива..."
        cd src-tauri/target/x86_64-pc-windows-msvc/release/
        zip -r ../../../../releases/FontMuse-windows-portable.zip FontMuse.exe
        cd ../../../../
        log "Windows архив создан ✓"
    fi
    
    # Linux AppImage
    if [ -f "src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/"*.AppImage ]; then
        log "Создание Linux portable архива..."
        find src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/ -name "*.AppImage" -exec cp {} releases/FontMuse-linux-portable.AppImage \;
        log "Linux архив создан ✓"
    fi
    
    # macOS Intel
    if [ -d "src-tauri/target/x86_64-apple-darwin/release/bundle/macos/FontMuse.app" ]; then
        log "Создание macOS Intel архива..."
        cd src-tauri/target/x86_64-apple-darwin/release/bundle/macos/
        tar -czf ../../../../../releases/FontMuse-macos-intel-portable.tar.gz FontMuse.app
        cd ../../../../../
        log "macOS Intel архив создан ✓"
    fi
    
    # macOS ARM
    if [ -d "src-tauri/target/aarch64-apple-darwin/release/bundle/macos/FontMuse.app" ]; then
        log "Создание macOS ARM архива..."
        cd src-tauri/target/aarch64-apple-darwin/release/bundle/macos/
        tar -czf ../../../../../releases/FontMuse-macos-arm-portable.tar.gz FontMuse.app
        cd ../../../../../
        log "macOS ARM архив создан ✓"
    fi
}

# Показать результаты
show_results() {
    log "Результаты сборки:"
    echo ""
    
    if [ -d "releases" ] && [ "$(ls -A releases/)" ]; then
        echo -e "${BLUE}Созданные архивы:${NC}"
        ls -la releases/
        echo ""
        
        total_size=$(du -sh releases/ | cut -f1)
        echo -e "${GREEN}Общий размер: $total_size${NC}"
        echo ""
        
        echo -e "${YELLOW}Готово для загрузки на GitHub Releases!${NC}"
        echo "Файлы находятся в папке: releases/"
    else
        error "Не удалось создать ни одного архива"
        exit 1
    fi
}

# Основной процесс
main() {
    check_dependencies
    clean_build
    install_deps
    build_frontend
    
    log "Начинаем сборку portable версий..."
    
    # Определяем текущую ОС
    OS="$(uname -s)"
    
    # Сборка для разных платформ
    case "$OS" in
        Darwin*)
            # macOS - можем собрать macOS и возможно другие платформы
            log "Обнаружена macOS. Собираем для macOS..."
            build_platform "macos-intel" "x86_64-apple-darwin" "macOS Intel"
            build_platform "macos-arm" "aarch64-apple-darwin" "macOS Apple Silicon"
            
            # Пытаемся собрать для других платформ (может не сработать без дополнительной настройки)
            build_platform "windows" "x86_64-pc-windows-msvc" "Windows" || warn "Windows сборка не удалась (требует дополнительной настройки)"
            build_platform "linux" "x86_64-unknown-linux-gnu" "Linux" || warn "Linux сборка не удалась (требует дополнительной настройки)"
            ;;
        Linux*)
            # Linux - можем собрать Linux и возможно Windows
            log "Обнаружен Linux. Собираем для Linux..."
            build_platform "linux" "x86_64-unknown-linux-gnu" "Linux"
            
            # Попытка сборки для Windows (может потребовать wine или минimalГВкомпиляторГВ)
            build_platform "windows" "x86_64-pc-windows-msvc" "Windows" || warn "Windows сборка не удалась (требует дополнительной настройки)"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            # Windows - собираем для Windows
            log "Обнаружена Windows. Собираем для Windows..."
            build_platform "windows" "x86_64-pc-windows-msvc" "Windows"
            ;;
        *)
            warn "Неизвестная ОС: $OS. Пытаемся собрать для текущей платформы..."
            ;;
    esac
    
    create_archives
    show_results
}

# Запуск скрипта
main "$@"