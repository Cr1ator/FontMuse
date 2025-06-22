# FontMuse by DMD - Project Overview

## 🎯 Project Description

**FontMuse** is a modern desktop font preview application built with Tauri 2.0 and Next.js. It provides an intuitive interface for browsing, searching, and previewing system fonts on Windows with real-time text monitoring and customizable preview options.

## 🏗️ Core Architecture

### Technology Stack
- **Backend**: Rust + Tauri 2.0
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Internationalization**: react-i18next (English/Russian)
- **Platform**: Windows Desktop (with system font access)
- **Build Tool**: Tauri CLI 2.0

### Application Structure
```
FontMuse/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Main Rust logic + Windows API integration
│   │   ├── lib.rs       # Tauri library entry point
│   │   └── build.rs     # Build configuration
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── app/                 # Next.js frontend
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Main application page
│   └── globals.css      # Global styles + themes
├── components/          # React components
│   ├── ui/              # shadcn/ui base components
│   ├── providers/       # Theme & i18n providers
│   └── *.tsx            # Application-specific components
├── lib/                 # Utilities and configurations
│   ├── theme/           # Theme management
│   ├── i18n.ts          # Internationalization setup
│   └── utils.ts         # Helper functions
└── locales/             # Translation files
    ├── en.json          # English translations
    └── ru.json          # Russian translations
```

## 🔧 Core Functionality

### 1. Font Management
- **System Font Detection**: Automatically scans Windows system fonts directory (`%WINDIR%/Fonts`) and user fonts (`%LOCALAPPDATA%/Microsoft/Windows/Fonts`)
- **Font Categorization**: Distinguishes between system and user-installed fonts
- **Format Support**: TTF and OTF font formats
- **Smart Sorting**: Alphabetical sorting with case-insensitive comparison

### 2. Preview System
- **Real-time Preview**: Live font preview with customizable text
- **Dynamic Font Size**: Adjustable font size slider (8px - 200px)
- **Custom Text Input**: User-defined preview text with placeholder fallback
- **Responsive Grid**: Adaptive card-based layout for font display

### 3. Advanced Features
- **Clipboard Monitoring**: Automatic detection of selected text from any application
- **Search & Filter**: Real-time font search with debounced input
- **System Font Toggle**: Option to hide/show system fonts
- **Window Management**: Always-on-top functionality for font comparison
- **Multi-language Support**: English and Russian interface
- **Theme System**: Light/Dark/System theme support with persistence

### 4. Windows Integration
- **Native Clipboard Access**: Direct Windows API integration for text selection monitoring
- **System Language Detection**: Automatic language detection based on Windows locale
- **Window Controls**: Native window styling and behavior
- **File System Access**: Secure font file system scanning

## 🔒 Security & Permissions

### Tauri Security Model
- **Capability-based Security**: Uses Tauri 2.0 ACL (Access Control List) system
- **File System Permissions**: Controlled access to font directories via `tauri-plugin-fs`
- **IPC Security**: Type-safe communication between frontend and backend
- **No Remote Content**: All resources bundled locally for security

### Configured Capabilities
```json
{
  "permissions": [
    "core:default",           // Core Tauri functionality
    "fs:allow-read-text-file", // File reading permissions
    "fs:allow-resource-read-recursive" // Resource directory access
  ]
}
```

## 🎨 User Interface Design

### Component Architecture
- **Modular Design**: Reusable UI components with shadcn/ui
- **Responsive Layout**: Adaptive grid system for different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Consistent Theming**: CSS custom properties with smooth transitions

### Key UI Components
1. **Controls Panel**: Search, text input, font size slider, filters
2. **Font Grid**: Card-based font preview layout
3. **Theme Toggle**: Light/Dark/System theme switcher
4. **Language Switcher**: English/Russian language toggle
5. **Window Controls**: Pin/unpin window functionality

### Theme System
- **CSS Custom Properties**: Dynamic theme switching
- **Tauri Window Integration**: Native window theme synchronization
- **Persistent Storage**: Theme preference saved to local app data
- **System Theme Detection**: Automatic theme based on OS preference

## 📦 Build & Deployment

### Development Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Build Configuration
- **Next.js SSG**: Static site generation for Tauri integration
- **Asset Bundling**: Optimized asset handling for desktop
- **Icon Generation**: Multi-format icon generation for Windows
- **Installer Creation**: MSI installer generation for Windows distribution

## 🔄 State Management

### Application State
- **Local State**: React hooks for component-level state
- **Theme State**: Context-based theme management with persistence
- **i18n State**: Language preference with file-based persistence
- **Font Data**: Cached font list with search filtering
- **Window State**: Always-on-top preference tracking

### Data Persistence
- **Theme Preferences**: Stored in `%LOCALAPPDATA%/settings/theme.txt`
- **Language Settings**: Stored in `%LOCALAPPDATA%/settings/language.txt`
- **No User Data**: Application doesn't store personal font data

## 🔌 API Integration

### Tauri Commands
```rust
// Font system integration
get_system_fonts() -> Vec<FontInfo>

// Clipboard monitoring
get_selected_text() -> String

// System language detection
get_system_language() -> String
```

### Windows API Integration
- **Clipboard Access**: `GetClipboardData` for text monitoring
- **Language Detection**: `GetUserDefaultLCID` for locale detection
- **Font Enumeration**: File system scanning for font discovery

## 🌍 Internationalization

### Language Support
- **English**: Default language with comprehensive translations
- **Russian**: Full Russian localization
- **Dynamic Loading**: Runtime language switching
- **Persistent Preference**: Language choice saved across sessions

### Translation Structure
```json
{
  "window": { "title": "..." },
  "controls": { 
    "search": { "placeholder": "..." },
    "preview": { "placeholder": "..." }
  },
  "fontGrid": { "loading": "...", "error": "..." },
  "theme": { "toggle": "...", "light": "..." }
}
```

## 🛠️ Development Patterns

### Code Organization
- **TypeScript**: Strict typing throughout the application
- **Custom Hooks**: Reusable logic with `useDebounce` for search
- **Provider Pattern**: Theme and i18n context providers
- **Component Composition**: Modular UI component architecture

### Error Handling
- **Rust Error Propagation**: Proper error handling with Result types
- **Frontend Error Boundaries**: Graceful error state handling
- **User Feedback**: Meaningful error messages and loading states

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Debounced Search**: Reduced API calls with 300ms debounce
- **Memoization**: React optimization for expensive operations
- **Lazy Loading**: Component-level code splitting
- **Asset Optimization**: Optimized images and bundle sizes

### Backend Optimizations
- **Efficient Font Scanning**: Single-pass directory traversal
- **Memory Management**: Rust's ownership model for efficient memory usage
- **Async Operations**: Non-blocking clipboard monitoring

## 🔍 Future Extensibility

### Planned Enhancements
- **Multi-platform Support**: macOS and Linux compatibility
- **Font Installation**: Direct font installation from preview
- **Font Comparison**: Side-by-side font comparison mode
- **Export Functionality**: Font preview export to images
- **Plugin System**: Extensible plugin architecture

### Technical Debt & Improvements
- **Font Metadata**: Extended font information display
- **Performance Monitoring**: Runtime performance metrics
- **Automated Testing**: Unit and integration test coverage
- **Documentation**: Comprehensive API documentation

## 🔐 Security Considerations

### Data Privacy
- **No Telemetry**: Application doesn't collect user data
- **Local Processing**: All operations performed locally
- **Minimal Permissions**: Only required system access
- **Secure Storage**: Settings stored in user's local app data

### Code Security
- **Input Validation**: Proper validation of user inputs
- **Path Traversal Protection**: Secured file system access
- **Memory Safety**: Rust's memory safety guarantees
- **Dependency Auditing**: Regular security dependency updates

---

## 📋 Summary

FontMuse is a comprehensive, modern font preview application that combines the power of Rust/Tauri 2.0 backend with a polished Next.js frontend. It provides professional font management capabilities with advanced features like clipboard monitoring, multi-language support, and extensive customization options. The application follows modern security practices, maintains high performance standards, and offers an intuitive user experience for font professionals and enthusiasts.

The project demonstrates best practices in desktop application development, cross-platform UI design, and secure system integration while maintaining code quality and extensibility for future enhancements.