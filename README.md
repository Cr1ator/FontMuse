# FontMuse ✨

<p align="center">
  <strong>A sleek, modern font manager and preview tool for Windows, built with Rust, Tauri 2.0, and Next.js.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/Cr1ator/FontMuse?style=for-the-badge" alt="Latest Release">
  <img src="https://img.shields.io/github/license/Cr1ator/FontMuse?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/stars/Cr1ator/FontMuse?style=for-the-badge&logo=github" alt="GitHub Stars">
</p>

---

<p align="center">
  <img src="./.github/assets/fontmuse-demo.gif" alt="FontMuse Application Demo">
</p>

**FontMuse** provides an intuitive interface for browsing, searching, and previewing system fonts. It's designed for developers, designers, and anyone who works with typefaces, offering powerful features like real-time clipboard monitoring and extensive customization options in a secure, high-performance desktop application.

## 🚀 Key Features

-   **👁️ Live Font Preview**: Instantly see how your text looks in any system font.
-   **📋 Live Clipboard Monitoring**: Automatically previews text you copy from **any** application.
-   **⚡ Blazing Fast**: Built with Rust on the backend for native performance.
-   **🎨 Modern UI**: Beautiful and responsive interface built with Next.js and shadcn/ui.
-   **🎚️ Full Customization**: Adjust font size, change preview text, and filter fonts in real-time.
-   **🌗 Light & Dark Themes**: Syncs with your system theme or choose your preference.
-   **🌍 Multi-language Support**: Fully localized for English and Russian.
-   **🔒 Secure by Design**: Leverages Tauri's capability-based security model. No telemetry, all data stays on your machine.
-   **📌 Always-On-Top**: Pin the window to keep it visible for easy comparison.

## 📥 Download

Get the latest version of FontMuse for Windows from the official releases page.

| File Type | Description | Download |
| :--- | :--- | :--- |
| **`.msi`** | **Installer (Recommended)** | <a href="https://github.com/Cr1ator/FontMuse/releases/latest">Latest Release</a> |
| **`.exe`** | Standalone Installer | <a href="https://github.com/Cr1ator/FontMuse/releases/latest">Latest Release</a> |
| **`.zip`** | Portable Version | <a href="https://github.com/Cr1ator/FontMuse/releases/latest">Latest Release</a> |

## 🛠️ Technology Stack

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?style=for-the-badge&logo=shadcn-ui&logoColor=white)

## 👨‍💻 For Developers

Interested in contributing or running the project from source? We'd love your help!

### Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Cr1ator/FontMuse.git
    cd FontMuse
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start the development server:**
    This will launch the application in development mode with hot-reloading.
    ```bash
    pnpm tauri dev
    ```

4.  **Build for production:**
    ```bash
    pnpm tauri build
    ```

### Project Structure

The project is organized into two main parts: the Rust backend (`src-tauri`) and the Next.js frontend (`./`).

```FontMuse/
├── src-tauri/           # Rust backend (Tauri)
├── app/                 # Next.js frontend (React)
├── components/          # UI Components
├── lib/                 # Utilities & Configs
└── locales/             # Translation files
```

### Contributing

Contributions are welcome! Please feel free to open an issue to discuss a new feature or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.