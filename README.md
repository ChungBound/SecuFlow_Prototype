# Project Setup Guide

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.cs.adelaide.edu.au/SecuFlow-PG1/Front-end.git
   ```

2. Node version requirement: 20 or higher. It's recommended to use NVM for managing Node versions.

3. Run these commands to start:
   ```
   # Install dependencies
   pnpm install

   # Start the development server
   pnpm run dev
   ```

## VS Code Setup

If you're using Visual Studio Code, please install the following plugins:

- EditorConfig for VS Code
- DotENV
- ESLint
- stylelint
- Vue - Official
- UnoCSS

When you open the source code folder in Visual Studio Code, it will automatically prompt you to install the required dependencies. Simply click to install them.

## Tech Stack

This project uses the following technologies:

- Node
- Vite
- Vue 3 (see [v3 migration guide](https://v3-migration.vuejs.org/))
- Vue Router
- Pinia
- UnoCSS
- Pager
- Element-ui

## IDE Configuration

- Editor configuration file: `.editorconfig`

### ESLint Configuration

- Configuration file: `eslint.config.js`
- [ESLint official website](https://eslint.org/)

### StyleLint Configuration

- Configuration file: `stylelint.config.js`
- [StyleLint official website](https://stylelint.io/)
