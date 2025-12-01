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

### ✨ Task Management
- Create tasks with titles and descriptions
- Color-code tasks (8 colors available)
- Mark tasks as complete
- Edit and delete tasks
- Click any task to edit it

### 🔁 Recurring Tasks
- Daily, weekly, or monthly repetition
- Optional end dates
- Edit parent task to update all instances

### ⌨️ Keyboard Shortcuts
- `Shift + Q` - Switch to Month view
- `Shift + W` - Switch to Week view
- `Shift + E` - Switch to Day view
- `Shift + A` - Add new task
- `Esc` - Close modal

### 💾 Data Management
- Export tasks to JSON file
- Import tasks from JSON file
- Clear all tasks
- All data stored locally (offline, private)

### 🎨 Beautiful UI
- Smooth animations and transitions
- Responsive design
- Color-coded tasks
- Visual feedback for all actions
- Empty states with helpful hints

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

### Why Not Just Open index.html?

Modern browsers block ES modules from `file://` for security. The app needs to run through a web server (even locally). The included server scripts make this super easy - just one double-click!

### Requirements for Users
- Python 3 (pre-installed on Mac/Linux, Windows users may need to install from python.org)
- Any modern web browser

## Usage Tips

### Creating Tasks
- Click any date to create a task
- Use `Shift + A` for quick task creation
- Fill in details, choose a color, and optionally make it recurring

### Recurring Tasks
- Check "Recurring task" when creating
- Select frequency (daily/weekly/monthly)
- Optionally set an end date
- Edit any instance to update the entire series

### Navigation
- Use arrow buttons (← →) to navigate between periods
- "Today" button jumps to current date
- Click view buttons or use keyboard shortcuts to switch views

### Data Backup
- Regularly export your tasks via the menu (⋮)
- Store the JSON file safely
- Import on a new device or after clearing data

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
- **Storage:** Browser localStorage
- **Bundle Size:** ~61KB JS, ~16KB CSS (gzipped)

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox

## Privacy

- All data stored locally in your browser
- No external servers or tracking
- No internet connection required
- Export your data anytime

## License

MIT
