# Tauri + React LaTeX Resume Builder

A professional, cross-platform desktop application designed to generate beautiful resumes using the power of LaTeX, without requiring users to write any LaTeX code.

## Project Overview

This application provides a simple, intuitive user interface for professionals to create, manage, and update their resumes. It leverages a predefined LaTeX template in the backend to produce perfectly typeset, high-quality PDF documents. The core philosophy is to separate content creation from document formatting, allowing users to focus on their career story while the application handles the presentation.

### Core Features

  * **Intuitive Form-Based UI:** Edit every section of your resume using a simple and modern interface.
  * **Live Preview:** See your resume update in real-time as you type, rendered directly in the app.
  * **One-Click PDF Generation:** Generate a flawless PDF with a single click, powered by an embedded LaTeX engine. No external installation of LaTeX is required.
  * **Local Version Control:** Save different versions of your resume for various job applications. All data is stored privately and securely on your local machine.
  * **Cross-Platform:** A single codebase builds for Windows, macOS, and Linux.

### Technology Stack

This project uses a hybrid approach, combining a web-based frontend with a high-performance Rust backend.

  * **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/) for a modern, fast development experience.
  * **Backend:** [Rust](https://www.rust-lang.org/) for memory safety and performance.
  * **Core Framework:** [Tauri](https://tauri.app/) for building a native desktop application with a webview frontend.
  * **PDF Generation:** The [Tectonic](https://tectonic-typesetting.github.io/) crate, which acts as a complete, self-contained TeX/LaTeX engine.
  * **Database:** [SQLite](https://www.sqlite.org/index.html) for local, file-based data persistence, managed via the `tauri-plugin-sql`.
  * **Live Preview Rendering:** The [KaTeX](https://katex.org/) library for fast LaTeX rendering in the frontend.

## Getting Started: Developer Environment Setup

Follow these steps to get the project running on your local machine for development and testing purposes.

### 1\. System Prerequisites

Before you begin, you must have the necessary system-wide dependencies installed for Tauri development. This includes the Rust toolchain, Node.js, and platform-specific build tools.

The official Tauri documentation has the most up-to-date guide. Please follow it carefully:

[**Tauri Prerequisites Guide**](https://tauri.app/v1/guides/getting-started/prerequisites)

### 2\. Clone and Install

Once the prerequisites are installed, clone the repository and install the frontend dependencies.

```bash
# 1. Clone the repository to your local machine
git clone https://github.com/your-repo/your-resume-app.git

# 2. Navigate into the project directory
cd your-resume-app

# 3. Install the Node.js dependencies for the frontend
npm install
```

Rust dependencies listed in `src-tauri/Cargo.toml` will be automatically fetched and compiled the first time you run the application.

### 3\. Running the Application in Development Mode

To start the application in development mode with hot-reloading for both the frontend and backend, run the following command:

```bash
npm run tauri dev
```

This command will:

1.  Start the Vite development server for the React frontend.
2.  Compile and run the Rust backend.
3.  Launch the native Tauri application window, which will load the frontend from the Vite server.

### 4\. Building for Production

To build the final, optimized, and distributable application for your platform, run:

```bash
npm run tauri build
```

The resulting installers and executables will be located in the `src-tauri/target/release/bundle/` directory.

## Project Structure

The project is organized into two main parts:

  * `src/`: Contains all the frontend React/TypeScript code.
      * `components/`: Reusable React components that make up the UI.
      * `App.tsx`: The main application component where state and layout are managed.
      * `types.ts`: TypeScript interfaces, including the core `ResumeData` model.
  * `src-tauri/`: Contains all the backend Rust code and Tauri configuration.
      * `src/main.rs`: The main Rust entry point where all backend commands (`generate_pdf`, `save_version`, etc.) are defined.
      * `template.tex`: The master LaTeX template file used for PDF generation.
      * `tauri.conf.json`: The central Tauri configuration file for managing plugins, permissions, and application metadata.
      * `Cargo.toml`: The Rust dependency manifest.