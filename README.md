# FORGE Calendar App

A beautiful, offline task calendar built with Svelte. Manage your tasks across month, week, and day views with powerful features like recurring tasks, color coding, and keyboard shortcuts.

Try it out - [forge-calendar](https://psyklopp.github.io/forge-calendar/)

✅ Safe for users - Data never leaves their device

✅ Private by design - No server storage

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

## Sharing with Others - run local

### Building for Distribution

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

4. **For recipients:**
   - Unzip the folder
   - **Windows:** Double-click `START_SERVER.bat`
   - **Mac/Linux:** Double-click `START_SERVER.sh`
   - Browser opens automatically with the app!

### Requirements for Users
- Python 3 (pre-installed on Mac/Linux, Windows users may need to install from python.org)
- Any modern web browser

## Project Structure

```
forge-calendar-app/
├── src/
│   ├── components/
│   │   ├── MonthView.svelte   # Month calendar grid
│   │   ├── WeekView.svelte    # Week columns
│   │   ├── DayView.svelte     # Single day detail
│   │   └── TaskForm.svelte    # Task creation/editing modal
│   ├── lib/
│   │   ├── taskStore.js       # State management
│   │   ├── taskHelpers.js     # Task utilities
│   │   ├── storage.js         # localStorage wrapper
│   │   ├── dateUtils.js       # Date calculations
│   │   └── weekUtils.js       # Week-specific utilities
│   ├── App.svelte             # Main app component
│   ├── app.css                # Tailwind styles
│   └── main.js                # Entry point
├── dist/                      # Built files (after npm run build)
├── package.json
└── README.md
```

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
