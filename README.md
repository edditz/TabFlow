# Tab Tool

A browser extension for enhanced tab management, supporting both Chrome and Edge.

## Features

- **Global Search Panel**: Quick search across all open tabs with keyboard shortcut
- **Settings Page**: Configure extension preferences
- **Cross-browser Support**: Works on Chrome and Edge

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build
```

### Loading the Extension

#### Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder

#### Edge

1. Open `edge://extensions/`
2. Enable "Developer mode" (left panel)
3. Click "Load unpacked"
4. Select the `dist` folder

### Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Toggle Search Panel | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Open Extension Popup | `Ctrl+Shift+Y` | `Cmd+Shift+Y` |

## Project Structure

```
tab-tool/
├── src/
│   ├── background/     # Service worker
│   ├── content/        # Content script (injected into pages)
│   ├── popup/          # Extension popup
│   └── options/        # Settings page
├── icons/              # Extension icons
├── manifest.json       # Extension manifest (MV3)
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Tech Stack

- [Vite](https://vitejs.dev/) - Build tool
- [CRXJS](https://crxjs.dev/) - Chrome extension support for Vite
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT
