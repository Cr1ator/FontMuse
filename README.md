# FontMuse ✨

A lightning-fast, open-source font viewer for your desktop. Find your perfect font, instantly.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)
[![GitHub releases](https://img.shields.io/github/release/Cr1ator/FontMuse.svg)](https://github.com/Cr1ator/FontMuse/releases)
[![GitHub issues](https://img.shields.io/github/issues/Cr1ator/FontMuse.svg)](https://github.com/Cr1ator/FontMuse/issues)

---

Tired of endlessly clicking through font dropdowns in your design software? Or waiting for slow, ad-filled web tools to load? We were too.

**FontMuse** is a simple, free desktop utility built to solve one problem: making font discovery and previewing fast, easy, and efficient. It scans all the fonts on your system and displays them instantly with your own custom text. No lag, no internet required, just pure performance.

<!-- 
  TODO: A picture is worth a thousand words! 
  Add a cool GIF of FontMuse in action here. It's the best way to show off its speed.
-->
<p align="center">
  <img src="https//place-your-app-demo-gif-here.gif" alt="FontMuse Demo">
</p>

## Key Features

FontMuse is packed with features designed to speed up your workflow.

*   👁️ **Live Preview:** See your text rendered in every single system font, all at once, in real-time.
*   ⚡ **Lightning-Fast Search:** Find the exact font you're looking for in seconds, even if you have thousands installed.
*   📋 **Clipboard Sync:** Copy a font name from anywhere (like a design spec or website), and FontMuse will automatically jump to it.
*    LAYER **System Font Filter:** Hide the boring default system fonts to focus on your own curated, custom collection.
*   📌 **Always-On-Top Mode:** Pin the FontMuse window above your other apps (like Figma, VS Code, or Photoshop) for seamless designing and coding.
*   🚀 **True Native Performance:** Built with Rust and Tauri for incredible speed and minimal memory usage. It feels right at home on your desktop.

## Why a Native App?

You might be wondering why you need a desktop app when there are web tools. Here’s the difference:

| FontMuse (Native) ✅                               | Web-Based Tools ❌                               |
| -------------------------------------------------- | ------------------------------------------------ |
| Instant startup and zero-lag response              | Slow page loads and network latency              |
| Works completely offline, anywhere, anytime        | Requires a stable internet connection            |
| Tiny CPU and RAM footprint                         | Can be a major resource hog in your browser      |
| Full, direct access to all your local system fonts | Limited font access or requires manual uploads  |
| 100% private—your fonts and data never leave your PC | Potential privacy risks with font/data uploads |

## Installation

Getting started is super easy. No complex installation needed!

1.  Head over to the [**Releases**](https://github.com/Cr1ator/FontMuse/releases) page.
2.  Download the latest version for your operating system (Windows is available now, with macOS and Linux coming soon!).
3.  Unzip the file.
4.  Run the `FontMuse.exe` application. That's it!

## Roadmap

FontMuse is an active project, and we've got big plans for the future! Here's a sneak peek at what we're working on.

#### 🟢 In Progress
*   **Collections & Favorites:** Group fonts by project and save your top picks.
*   **Smart Tags:** Tag fonts with custom labels (`serif`, `script`, `project-x`) for even faster filtering.

#### 🔵 Planned
*   **Figma Plugin:** A direct integration for a truly seamless design workflow.
*   **Google Fonts Integration:** Preview and use the entire Google Fonts library right from the app.

#### 💡 Ideas
*   **AI-Powered Font Pairing:** Get smart suggestions for beautiful heading and body text combinations.
*   **Font Metadata Viewer:** See detailed info about a font, like its author and license.

## Contributing

This is an open-source project, and we'd love your help to make it even better! Whether you want to report a bug, suggest a feature, or write some code, all contributions are welcome.

1.  **Fork the repository.**
2.  Create your feature branch (`git checkout -b feature/AmazingNewFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingNewFeature'`).
4.  Push to the branch (`git push origin feature/AmazingNewFeature`).
5.  Open a **Pull Request**.

Not sure where to start? Check out the [open issues](https://github.com/Cr1ator/FontMuse/issues)!

## Technology Stack

FontMuse is made of two main parts:

*   **🖥️ The Desktop App:**
    *   **[Rust](https://www.rust-lang.org/):** For backend logic, performance, and safety.
    *   **[Tauri](https://tauri.app/):** To build a lightweight, cross-platform desktop app using a web frontend.
    *   **[React](https://reactjs.org/):** For the user interface.

*   **🌐 This Landing Page:**
    *   **[Next.js](https://nextjs.org/):** For a fast, server-rendered React site.
    *   **[TypeScript](https://www.typescriptlang.org/):** For type safety and a better developer experience.
    *   **[Tailwind CSS](https://tailwindcss.com/):** For styling the beautiful UI you see.

## Acknowledgements

This project wouldn't exist without these amazing people:

*   **Developer:** Amid ([amid.it.com](https://amid.it.com))
*   **Studio:** DMD Studio ([dmdstudio.org](https://dmdstudio.org))
*   **Idea Author:** Alexey V

## License

This project is released under the **MIT License**. See the [LICENSE.md](LICENSE.md) file for details. You're free to use, modify, and distribute it.