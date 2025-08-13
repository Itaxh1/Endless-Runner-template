# 🎮 Endless Runner Game Template

A modular, LLM-friendly endless runner game built with Next.js, TypeScript, and Babylon.js.

## 🏗️ Architecture Overview

This template is designed to be easily customizable by LLMs and developers. The codebase is split into focused modules:

### 📁 Main Files Structure

\`\`\`
components/
├── game.tsx                 # 🎮 Main game orchestrator
├── game/
│   ├── game-engine.tsx     # 🚀 3D graphics & Babylon.js
│   ├── game-logic.tsx      # 🧠 Physics & game mechanics  
│   ├── game-ui.tsx         # 🎨 User interface & overlays
│   └── game-controls.tsx   # 🎮 Input handling & controls
app/
├── page.tsx                # 📄 Main page component
├── layout.tsx              # 🏗️ App layout & fonts
└── globals.css             # 🎨 Styles & animations
\`\`\`

## 🔧 Key Customization Points

### 🎨 Visual Customization (game-engine.tsx)
\`\`\`typescript
// Easy color and material changes
export const VISUAL_CONFIG = {
  player: { color: new Color3(0, 0.8, 1) },    // Electric blue
  obstacle: { color: new Color3(1, 0.3, 0.3) }, // Red
  ground: { color: new Color3(0.3, 0.3, 0.4) }  // Dark gray
}
\`\`\`

### 🎯 Game Rules (game-logic.tsx)
\`\`\`typescript
// Modify scoring and difficulty
export const GAME_RULES = {
  scoring: { pointsPerObstacle: 10 },
  difficulty: { speedIncreaseRate: 0.0001 }
}
\`\`\`

### 🎮 Controls (game-controls.tsx)
\`\`\`typescript
// Add new control schemes
export const CONTROL_SCHEMES = {
  keyboard: {
    moveLeft: ['ArrowLeft', 'a', 'A'],
    jump: ['Space', 'w', 'W']
  }
}
\`\`\`

### 🎨 UI Themes (game-ui.tsx)
\`\`\`typescript
// Customize visual themes
export const UI_THEMES = {
  cyberpunk: {
    primary: "from-cyan-400 to-blue-600"
  }
}
\`\`\`

## 🚀 Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open browser:**
   Navigate to `http://localhost:3000`

## 🎮 Game Features

- **3D Graphics**: Powered by Babylon.js for smooth 3D rendering
- **Three-Lane Movement**: Use A/D or arrow keys to switch lanes
- **Jump Mechanics**: Press W or Space to jump over obstacles
- **Progressive Difficulty**: Speed increases over time
- **Scoring System**: Earn points for avoiding obstacles
- **Responsive Design**: Works on desktop and mobile
- **Modular Architecture**: Easy to extend and customize

## 🔧 LLM Modification Guide

### Adding New Features

1. **New Game Modes**: Modify `GameState` interface in `game-logic.tsx`
2. **Power-ups**: Extend `PlayerState` and add pickup logic
3. **Different Obstacles**: Add new types in `game-engine.tsx`
4. **Sound Effects**: Add audio handling in `game.tsx`
5. **Multiplayer**: Create network sync in new module

### Common Customizations

- **Change Colors**: Edit `VISUAL_CONFIG` in `game-engine.tsx`
- **Adjust Difficulty**: Modify `GAME_RULES` in `game-logic.tsx`
- **New Controls**: Add schemes to `CONTROL_SCHEMES` in `game-controls.tsx`
- **UI Styling**: Update `UI_THEMES` in `game-ui.tsx`

## 📱 Mobile Support

The game includes touch controls:
- **Left third of screen**: Move left
- **Right third of screen**: Move right  
- **Middle third of screen**: Jump

## 🎨 Styling System

Uses Tailwind CSS with custom cyberpunk-themed components:
- Glass morphism effects
- Neon text animations
- Gradient buttons with hover effects
- Responsive design patterns

## 🔍 Debug Mode

In development, debug info is shown in bottom-right corner:
- Player position and state
- Number of active obstacles
- Current game speed

## 📄 License

MIT License - Feel free to use and modify for your projects!
