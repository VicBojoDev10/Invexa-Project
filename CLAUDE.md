# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invexa is a gamified financial education application that teaches users about investing through interactive simulations. The app combines gameplay mechanics with real financial concepts to help users learn at their own pace.

## Quick Start

```bash
# Install dependencies (optional, for local server)
npm install

# Start local development server
npm start
# or
npx http-server docs -p 8080 -o
```

## Architecture

- **Frontend**: Static web application (HTML/CSS/JavaScript) in `docs/`
- **Deployment**: GitHub Pages ready (serves from `/docs` folder)
- **No build step required** - vanilla JS for simplicity

## File Structure

```
docs/
  index.html      # Main HTML with all view containers
  css/
    styles.css    # Complete styling with CSS variables, dark mode support
  js/
    i18n.js       # Internationalization system (EN/ES)
    app.js        # Main application logic, state management, view rendering
    main.js       # Entry point
```

## Key Features Implemented

### 1. Bilingual Support (EN/ES)
- `i18n.js` contains all translations
- Language selector in top-right corner
- Persists user preference in localStorage
- All UI elements use `data-i18n` attributes for automatic translation

### 2. Onboarding Flow
- Welcome screen with finance level selection (beginner, basic, intermediate, advanced)
- Tutorial overlay with 3-step introduction
- First reward given after tutorial completion

### 3. Main Sections (Bottom Navigation)

**Invertir (Invest)**
- 5 investment types: Stocks, ETFs, Credit Cards, Mortgages, Crypto
- Investment modal with simulation and confirmation
- Financial concepts displayed for beginner users

**Misiones (Missions)**
- Mission cards with progress bars
- Types: login streak, daily collection, achievements
- Claim rewards upon completion

**Progreso (Progress)**
- Level display with XP bar
- Unlocked skills grid
- User history and coin balance

**Perfil (Profile)**
- User avatar and info
- Financial goals with progress tracking
- Quick settings (dark mode, notifications, language)

**Opciones (Options)**
- Music and sound toggles
- Privacy notice modal
- Block cards option
- Account deactivation/deletion
- Logout

### 4. Visual Style
- Modern gradient-based design (blue/purple primary theme)
- Card-based UI components
- Smooth animations and transitions
- Dark mode support via CSS variables
- Responsive design for mobile devices

## State Management

Application state is stored in `App.state` and persisted to localStorage:
- `user`: name, email, level, xp, coins, investments, missions, skills
- `settings`: music, sound, notifications, darkMode
- `userLevel`: selected during onboarding

## Common Development Tasks

### Add a new translation
Edit `docs/js/i18n.js` - add key to both `es` and `en` objects:
```javascript
es: { myNewKey: 'Texto en español' },
en: { myNewKey: 'English text' }
```

### Add a new investment type
Edit `App.investments` array in `app.js`:
```javascript
{
  id: 'newInvestment',
  icon: '📊',
  minLevel: 1,
  riskLevel: 'medium',
  potentialReturn: '5-10%'
}
```
Remember to add translations for `newInvestment` and `newInvestmentDesc`.

### Add a new mission
Edit `App.missions` array in `app.js`:
```javascript
{
  id: 'mission-id',
  type: 'login|collect|invest|achievement',
  title: 'missionTitle',
  description: 'missionDesc',
  target: 5,
  reward: { coins: 100, xp: 50 },
  icon: '🎁'
}
```

### Modify visual theme
Edit CSS variables in `docs/css/styles.css`:
```css
:root {
  --primary: #2563eb;        /* Main brand color */
  --success: #10b981;        /* Success/growth actions */
  --accent: #f59e0b;         /* Highlights */
}
```

## Canva Design Integration

The visual style is designed to match a modern financial app aesthetic. To customize based on your Canva presentation:

1. Update CSS variables in `styles.css` to match your color scheme
2. Replace emoji icons with custom SVG icons from your design
3. Adjust border-radius values to match your design (currently uses rounded corners)
4. Modify gradient directions and colors as needed

## Design Doc Reference

The original design document `Propuesta diagramas de flujo Invexa (1).md` contains:
- User flow diagrams
- Financial concept definitions
- Authentication method options
- Complete menu structure
