# FORGE Calendar App

A beautiful, offline task calendar built with Svelte. Manage your tasks across month, week, and day views with powerful features like recurring tasks, color coding, and keyboard shortcuts.

Try it out - [forge-calendar](https://psyklopp.github.io/forge-calendar/)

✅ Private - Data never leaves the device

## Features

### 📅 Multiple Views
- **Month View** - See your entire month at a glance
- **Week View** - Focus on your current week with detailed task cards
- **Day View** - Dive deep into a single day's tasks

### ⌨️ Keyboard Shortcuts
- `Shift + Q` - Switch to Month view
- `Shift + W` - Switch to Week view
- `Shift + E` - Switch to Day view
- `Shift + A` - Add new task
- `Shift + B` - Switch to Brain view
- `Shift + N` - Quick note
- `Shift + M` - Switch to Money view
- `Esc` - Close task form

## Development

### Requirements
- Node.js v22+ and npm

### Setup
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Opens at http://localhost:5173

### Build for Production
```bash
npm run build
```

This creates a `dist/` folder with static files.

##  Running locally or sharing with others

### Building

1. **Build the project:**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with everything needed.

2. **The `dist/` folder contains:**
   - `index.html` - The app
   - `assets/` - JS and CSS files
   - `START_SERVER.py` - Python server script
   - `START_SERVER.bat` - Windows launcher
   - `START_SERVER.sh` - Mac/Linux launcher

3. **Share with others:**
   - Zip the entire `dist/` folder
   - Send via email, USB, cloud storage, etc.

4. **Users:**
   - Unzip the folder
   - **Windows:** Double-click `START_SERVER.bat`
   - **Mac/Linux:** Double-click `START_SERVER.sh`
   - Browser opens automatically with the app!

### Requirements for Users
- Python 3 (pre-installed on Mac/Linux, Windows users may need to install from python.org)
- Any modern web browser

## Technical Details

- **Framework:** Svelte 4
- **Styling:** Tailwind CSS 3
- **Build Tool:** Vite

## Privacy

- All data stored locally in your browser
- No external servers or tracking
- No internet connection required
- Export your data anytime

## License

MIT
