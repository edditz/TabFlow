# TabFlow

**English** | [中文](./README.zh-CN.md)

A browser extension for enhanced tab management, supporting both Chrome and Edge.

## Features

- **Global Search Panel**: Quick search across all open tabs with real-time filtering by title, URL, or domain
- **Sidebar Tab Manager**: Chrome Side Panel with compact, card, and tree layouts for browsing and managing open tabs, tab groups, and recently closed tabs
- **Smart Tab Classification**: One-click tab grouping into Chrome Tab Groups with 7 built-in categories (Work, Dev, Social, Shopping, Entertainment, News, Docs) and drag-and-drop reordering
- **AI-Powered Classification**: Optional AI integration (OpenAI-compatible) for tabs that don't match built-in rules
- **Recently Closed Tabs**: Restore recently closed tabs with configurable time window and result limit
- **Customizable Settings**: Theme (Light/Dark/System), language (English/Chinese), search scope, URL display style, and more
- **Custom Keyboard Shortcuts**: User-configurable shortcuts with Mac symbol display and conflict detection
- **i18n Support**: Full English and Chinese interface with real-time language switching
- **Theme System**: Light, Dark, and System themes with Shadow DOM style isolation
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

### Code Quality

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format
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
| Toggle Search Panel | `Ctrl+Shift+Z` | `Cmd+Shift+Z` |
| Toggle Side Panel | `Alt+L` | `Alt+L` |
| Open Extension Popup | `Ctrl+Shift+Y` | `Cmd+Shift+Y` |

## Project Structure

```
tabflow/
├── src/
│   ├── background/     # Service worker
│   ├── content/        # Content script (injected into pages)
│   ├── popup/          # Extension popup
│   ├── sidepanel/      # Side panel (sidebar tab manager)
│   ├── options/        # Settings page
│   ├── classification/ # Smart tab classification engine
│   ├── i18n/           # Internationalization
│   └── shared/         # Shared utilities
├── icons/              # Extension icons
├── manifest.json       # Extension manifest (MV3)
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Tech Stack

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [CRXJS](https://crxjs.dev/) - Chrome extension support for Vite
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [dnd-kit](https://dndkit.com/) - Drag and drop for classification

## License

MIT
