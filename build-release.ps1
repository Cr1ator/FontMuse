# FontMuse Release Build Script для Windows
# Автоматически собирает portable версии

param(
    [switch]$Clean = $false,
    [switch]$SkipDeps = $false
)

# Цвета для консоли
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Info($Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn($Message) {
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error($Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Check-Dependencies {
    Write-Info "Проверка зависимостей..."
    
    # Проверка Node.js
    try {
        $nodeVersion = node --version
        Write-Info "Node.js найден: $nodeVersion"
    }
    catch {
        Write-Error "Node.js не установлен"
        exit 1
    }
    
    # Проверка pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Info "pnpm найден: $pnpmVersion"
    }
    catch {
        Write-Error "pnpm не установлен. Установите: npm install -g pnpm"
        exit 1
    }
    
    # Проверка Rust
    try {
        $rustVersion = cargo --version
        Write-Info "Rust найден: $rustVersion"
    }
    catch {
        Write-Error "Rust не установлен"
        exit 1
    }
    
    # Проверка Tauri CLI
    try {
        $tauriVersion = tauri --version
        Write-Info "Tauri CLI найден: $tauriVersion"
    }
    catch {
        Write-Error "Tauri CLI не установлен. Установите: cargo install tauri-cli"
        exit 1
    }
    
    Write-Info "Все зависимости найдены ✓"
}

function Clean-Build {
    if ($Clean) {
        Write-Info "Очистка предыдущих сборок..."
        
        if (Test-Path "src-tauri\target") {
            Remove-Item "src-tauri\target" -Recurse -Force
        }
        if (Test-Path "out") {
            Remove-Item "out" -Recurse -Force
        }
        if (Test-Path "dist") {
            Remove-Item "dist" -Recurse -Force
        }
        if (Test-Path "releases") {
            Remove-Item "releases" -Recurse -Force
        }
        
        Write-Info "Очистка завершена ✓"
    }
}

function Install-Dependencies {
    if (-not $SkipDeps) {
        Write-Info "Установка зависимостей..."
        pnpm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Не удалось установить зависимости"
            exit 1
        }
        Write-Info "Зависимости установлены ✓"
    }
}

function Build-Frontend {
    Write-Info "Сборка фронтенда..."
    pnpm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Не удалось собрать фронтенд"
        exit 1
    }
    Write-Info "Фронтенд собран ✓"
}

function Build-Platform($Target, $DisplayName) {
    Write-Info "Сборка для $DisplayName ($Target)..."
    
    # Проверяем, установлен ли target
    $installedTargets = rustup target list --installed
    if ($installedTargets -notcontains $Target) {
        Write-Info "Установка target $Target..."
        rustup target add $Target
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Не удалось установить target $Target. Пропускаем..."
            return $false
        }
    }
    
    # Сборка
    tauri build --target $Target --config src-tauri/tauri.portable.conf.json
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Сборка для $DisplayName завершена ✓"
        return $true
    }
    else {
        Write-Warn "Сборка для $DisplayName не удалась"
        return $false
    }
}

function Create-Archives {
    Write-Info "Создание архивов для релиза..."
    
    # Создаем папку для релизов
    if (-not (Test-Path "releases")) {
        New-Item -ItemType Directory -Path "releases"
    }
    
    # Windows
    $windowsExe = "src-tauri\target\x86_64-pc-windows-msvc\release\FontMuse.exe"
    if (Test-Path $windowsExe) {
        Write-Info "Создание Windows portable архива..."
        Compress-Archive -Path $windowsExe -DestinationPath "releases\FontMuse-windows-portable.zip" -Force
        Write-Info "Windows архив создан ✓"
    }
    
    # Linux AppImage
    $linuxPath = "src-tauri\target\x86_64-unknown-linux-gnu\release\bundle\appimage"
    if (Test-Path $linuxPath) {
        $appImageFile = Get-ChildItem -Path $linuxPath -Filter "*.AppImage" | Select-Object -First 1
        if ($appImageFile) {
            Write-Info "Создание Linux portable архива..."
            Copy-Item $appImageFile.FullName "releases\FontMuse-linux-portable.AppImage"
            Write-Info "Linux архив создан ✓"
        }
    }
    
    # macOS (если собирали)
    $macosIntelPath = "src-tauri\target\x86_64-apple-darwin\release\bundle\macos\FontMuse.app"
    if (Test-Path $macosIntelPath) {
        Write-Info "Создание macOS Intel архива..."
        # Для Windows используем 7zip или другой архиватор, если доступен
        try {
            tar -czf "releases\FontMuse-macos-intel-portable.tar.gz" -C "src-tauri\target\x86_64-apple-darwin\release\bundle\macos" FontMuse.app
            Write-Info "macOS Intel архив создан ✓"
        }
        catch {
            Write-Warn "Не удалось создать macOS архив (требуется tar или 7zip)"
        }
    }
}

function Show-Results {
    Write-Info "Результаты сборки:"
    Write-Host ""
    
    if ((Test-Path "releases") -and (Get-ChildItem "releases" | Measure-Object).Count -gt 0) {
        Write-Host "Созданные архивы:" -ForegroundColor Cyan
        Get-ChildItem "releases" | Format-Table Name, Length, LastWriteTime
        
        $totalSize = (Get-ChildItem "releases" | Measure-Object -Property Length -Sum).Sum
        $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
        Write-Host "Общий размер: $totalSizeMB MB" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Готово для загрузки на GitHub Releases!" -ForegroundColor Yellow
        Write-Host "Файлы находятся в папке: releases\"
    }
    else {
        Write-Error "Не удалось создать ни одного архива"
        exit 1
    }
}

function Main {
    Write-Host "🚀 FontMuse Release Build Script для Windows" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    Check-Dependencies
    Clean-Build
    Install-Dependencies
    Build-Frontend
    
    Write-Info "Начинаем сборку portable версий..."
    
    # Сборка для Windows (основная платформа)
    $windowsSuccess = Build-Platform "x86_64-pc-windows-msvc" "Windows"
    
    # Попытка сборки для Linux (может потребовать WSL)
    $linuxSuccess = Build-Platform "x86_64-unknown-linux-gnu" "Linux"
    if (-not $linuxSuccess) {
        Write-Warn "Linux сборка не удалась. Для кроссплатформенной сборки настройте WSL или используйте GitHub Actions"
    }
    
    # macOS сборка на Windows обычно не работает
    Write-Warn "macOS сборка на Windows не поддерживается. Используйте GitHub Actions или macOS машину"
    
    Create-Archives
    Show-Results
}

# Запуск скрипта
try {
    Main
}
catch {
    Write-Error "Произошла ошибка: $_"
    exit 1
}