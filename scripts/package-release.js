#!/usr/bin/env node

/**
 * FontMuse Release Packaging Script
 * Автоматически создает архивы для GitHub Releases
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}[INFO]${colors.reset} ${message}`);
}

function warn(message) {
  console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (err) {
    error(`Command failed: ${command}`);
    throw err;
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const size = stats.size;
  const mb = (size / (1024 * 1024)).toFixed(2);
  return `${mb} MB`;
}

function detectPlatform() {
  const platform = os.platform();
  switch (platform) {
    case 'win32': return 'windows';
    case 'darwin': return 'macos';
    case 'linux': return 'linux';
    default: return 'unknown';
  }
}

function packageWindows() {
  const exePath = 'src-tauri/target/x86_64-pc-windows-msvc/release/FontMuse.exe';
  if (!fs.existsSync(exePath)) {
    warn('Windows executable not found, skipping...');
    return false;
  }

  log('Packaging Windows portable...');
  const outputPath = 'releases/FontMuse-windows-portable.zip';
  
  try {
    // Используем PowerShell для создания zip архива на Windows
    if (process.platform === 'win32') {
      exec(`powershell -Command "Compress-Archive -Path '${exePath}' -DestinationPath '${outputPath}' -Force"`);
    } else {
      // На Unix системах используем zip
      exec(`cd src-tauri/target/x86_64-pc-windows-msvc/release && zip -r ../../../../${outputPath} FontMuse.exe`);
    }
    
    log(`Windows archive created: ${outputPath} (${getFileSize(outputPath)})`);
    return true;
  } catch (err) {
    error('Failed to package Windows version');
    return false;
  }
}

function packageLinux() {
  const appImageDir = 'src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage';
  if (!fs.existsSync(appImageDir)) {
    warn('Linux AppImage not found, skipping...');
    return false;
  }

  log('Packaging Linux portable...');
  
  try {
    // Найти AppImage файл
    const files = fs.readdirSync(appImageDir);
    const appImageFile = files.find(file => file.endsWith('.AppImage'));
    
    if (!appImageFile) {
      warn('AppImage file not found in directory');
      return false;
    }
    
    const sourcePath = path.join(appImageDir, appImageFile);
    const outputPath = 'releases/FontMuse-linux-portable.AppImage';
    
    // Копируем AppImage файл
    fs.copyFileSync(sourcePath, outputPath);
    
    // Делаем исполняемым на Unix системах
    if (process.platform !== 'win32') {
      exec(`chmod +x ${outputPath}`);
    }
    
    log(`Linux archive created: ${outputPath} (${getFileSize(outputPath)})`);
    return true;
  } catch (err) {
    error('Failed to package Linux version');
    return false;
  }
}

function packageMacOS(arch = 'x86_64') {
  const target = arch === 'aarch64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
  const appPath = `src-tauri/target/${target}/release/bundle/macos/FontMuse.app`;
  
  if (!fs.existsSync(appPath)) {
    warn(`macOS ${arch} app bundle not found, skipping...`);
    return false;
  }

  const archName = arch === 'aarch64' ? 'arm' : 'intel';
  log(`Packaging macOS ${archName} portable...`);
  
  try {
    const outputPath = `releases/FontMuse-macos-${archName}-portable.tar.gz`;
    
    // Создаем tar.gz архив
    exec(`cd src-tauri/target/${target}/release/bundle/macos && tar -czf ../../../../../${outputPath} FontMuse.app`);
    
    log(`macOS ${archName} archive created: ${outputPath} (${getFileSize(outputPath)})`);
    return true;
  } catch (err) {
    error(`Failed to package macOS ${archName} version`);
    return false;
  }
}

function generateChecksums() {
  const releasesDir = 'releases';
  if (!fs.existsSync(releasesDir)) {
    return;
  }

  log('Generating checksums...');
  
  try {
    const files = fs.readdirSync(releasesDir);
    const checksumFile = path.join(releasesDir, 'checksums.txt');
    let checksumContent = '';
    
    for (const file of files) {
      if (file === 'checksums.txt') continue;
      
      const filePath = path.join(releasesDir, file);
      
      try {
        // Генерируем SHA256 checksum
        let command;
        if (process.platform === 'win32') {
          command = `powershell -Command "Get-FileHash -Path '${filePath}' -Algorithm SHA256 | Select-Object -ExpandProperty Hash"`;
        } else {
          command = `shasum -a 256 '${filePath}' | cut -d' ' -f1`;
        }
        
        const hash = execSync(command, { encoding: 'utf8' }).trim();
        checksumContent += `${hash}  ${file}\n`;
      } catch (err) {
        warn(`Failed to generate checksum for ${file}`);
      }
    }
    
    if (checksumContent) {
      fs.writeFileSync(checksumFile, checksumContent);
      log('Checksums generated: checksums.txt');
    }
  } catch (err) {
    error('Failed to generate checksums');
  }
}

function showSummary() {
  const releasesDir = 'releases';
  if (!fs.existsSync(releasesDir)) {
    error('No releases directory found');
    return;
  }

  const files = fs.readdirSync(releasesDir);
  if (files.length === 0) {
    error('No release files created');
    return;
  }

  console.log(`\n${colors.cyan}📦 Release Summary${colors.reset}`);
  console.log('==================');
  
  let totalSize = 0;
  files.forEach(file => {
    if (file === 'checksums.txt') return;
    
    const filePath = path.join(releasesDir, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    
    console.log(`${colors.green}✓${colors.reset} ${file} (${getFileSize(filePath)})`);
  });
  
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n${colors.blue}Total size: ${totalMB} MB${colors.reset}`);
  console.log(`${colors.yellow}📁 Files location: releases/${colors.reset}`);
  console.log(`${colors.green}🚀 Ready for GitHub Release!${colors.reset}\n`);
}

function main() {
  console.log(`${colors.cyan}🎁 FontMuse Release Packaging${colors.reset}`);
  console.log('==============================\n');
  
  // Создаем папку для релизов
  ensureDir('releases');
  
  const platform = detectPlatform();
  log(`Detected platform: ${platform}`);
  
  let packaged = 0;
  
  // Пакуем доступные версии
  if (packageWindows()) packaged++;
  if (packageLinux()) packaged++;
  if (packageMacOS('x86_64')) packaged++;
  if (packageMacOS('aarch64')) packaged++;
  
  if (packaged === 0) {
    error('No release packages were created');
    error('Make sure to build portable versions first:');
    error('  npm run build:portable');
    process.exit(1);
  }
  
  // Генерируем checksums
  generateChecksums();
  
  // Показываем итоги
  showSummary();
}

// Запускаем скрипт
if (require.main === module) {
  try {
    main();
  } catch (err) {
    error(`Script failed: ${err.message}`);
    process.exit(1);
  }
}