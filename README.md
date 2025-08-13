# Endless Runner Game Template

A modular endless runner built with **Next.js**, **TypeScript**, and **Babylon.js**, designed for quick customization by developers and LLMs.

## Structure

```

components/
├── game.tsx                 # Main game orchestrator
├── game/
│   ├── game-engine.tsx     # 3D graphics & Babylon.js
│   ├── game-logic.tsx      # Physics & rules
│   ├── game-ui.tsx         # UI & overlays
│   └── game-controls.tsx   # Input handling
app/
├── page.tsx                # Main page
├── layout.tsx              # Layout & fonts
└── globals.css             # Styles & animations

````

## Customization

- **Visuals** – Edit `VISUAL_CONFIG` in `game-engine.tsx`
- **Rules** – Change scoring/difficulty in `GAME_RULES` (`game-logic.tsx`)
- **Controls** – Add schemes in `CONTROL_SCHEMES` (`game-controls.tsx`)
- **UI Theme** – Modify `UI_THEMES` in `game-ui.tsx`

##  Quick Start

```bash
npm install
npm run dev
# Visit http://localhost:3000
````

##  Features

* Smooth 3D graphics (Babylon.js)
* Three-lane movement (A/D or arrow keys)
* Jump mechanics (W or Space)
* Progressive difficulty
* Scoring system
* Works on desktop & mobile
* Modular, extendable codebase

## Mobile Controls

* Left third → Move left
* Right third → Move right
* Middle third → Jump

## Styling

Built with **Tailwind CSS** featuring:

* Glassmorphism
* Neon text
* Gradient buttons
* Fully responsive layout

##  Debug Mode

Shows player state, obstacle count, and game speed in dev mode.


