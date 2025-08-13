"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * GAME UI MODULE
 * ===============
 * This module contains all UI components and overlays for the game.
 * LLMs can easily modify the visual design, layout, and user interface here.
 *
 * Key customization points:
 * - UI_THEMES: Color schemes, animations, visual effects
 * - LAYOUT_CONFIG: Positioning, sizing, responsive behavior
 * - CONTENT_CONFIG: Text, messages, instructions
 */

// 🎨 UI THEME CONFIGURATION - Easy to customize visual appearance
export const UI_THEMES = {
  cyberpunk: {
    primary: "from-cyan-400 to-blue-600",
    secondary: "from-purple-400 to-pink-600",
    accent: "from-green-400 to-emerald-600",
    danger: "from-red-400 to-orange-600",
  },

  neon: {
    glow: "drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    pulse: "animate-pulse",
    float: "animate-bounce",
  },

  glass: {
    backdrop: "backdrop-blur-md bg-black/20",
    card: "backdrop-blur-sm bg-card/80",
    border: "border-white/20",
  },
}

// 📱 LAYOUT CONFIGURATION - Responsive positioning and sizing
export const LAYOUT_CONFIG = {
  hud: {
    score: "top-6 left-6",
    speed: "top-6 right-6",
    controls: "bottom-6 left-6",
    level: "top-6 center",
  },

  modals: {
    center: "inset-0 flex items-center justify-center",
    overlay: "absolute inset-0 bg-black/60 backdrop-blur-sm",
  },
}

// 📝 CONTENT CONFIGURATION - Game text and messages
export const CONTENT_CONFIG = {
  title: "CYBER RUNNER",
  subtitle: "Navigate through the digital world and avoid the obstacles!",

  controls: {
    move: "A/D or ← → to move",
    jump: "W or Space to jump",
    pause: "ESC to pause",
  },

  messages: {
    gameOver: "SYSTEM BREACH!",
    newRecord: "NEW HIGH SCORE!",
    perfectRun: "PERFECT RUN BONUS!",
  },
}

interface GameUIProps {
  gameState: {
    isPlaying: boolean
    isGameOver: boolean
    score: number
    speed: number
    level?: number
  }
  onStartGame: () => void
  onResetGame: () => void
  onPauseGame?: () => void
}

/**
 * 🎮 MAIN GAME UI COMPONENT
 * Renders all UI overlays and game interface elements
 */
export const GameUI = ({ gameState, onStartGame, onResetGame, onPauseGame }: GameUIProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 📊 HUD ELEMENTS - Always visible game information */}
      <GameHUD gameState={gameState} />

      {/* 🎬 START SCREEN - Initial game menu */}
      {!gameState.isPlaying && !gameState.isGameOver && <StartScreen onStartGame={onStartGame} />}

      {/* 💀 GAME OVER SCREEN - End game results and restart options */}
      {gameState.isGameOver && (
        <GameOverScreen gameState={gameState} onStartGame={onStartGame} onResetGame={onResetGame} />
      )}

      {/* 🎮 IN-GAME CONTROLS - Control hints during gameplay */}
      {gameState.isPlaying && <ControlsHint />}
    </div>
  )
}

/**
 * 📊 HEADS-UP DISPLAY (HUD)
 * Shows score, speed, and other game metrics
 */
const GameHUD = ({ gameState }: { gameState: GameUIProps["gameState"] }) => (
  <>
    {/* Score Display */}
    <div className={`absolute ${LAYOUT_CONFIG.hud.score} pointer-events-auto`}>
      <Card className={`px-6 py-3 ${UI_THEMES.glass.card} ${UI_THEMES.glass.border}`}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
            SCORE
          </Badge>
          <span className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">
            {gameState.score.toLocaleString()}
          </span>
        </div>
      </Card>
    </div>

    {/* Speed Display */}
    <div className={`absolute ${LAYOUT_CONFIG.hud.speed} pointer-events-auto`}>
      <Card className={`px-6 py-3 ${UI_THEMES.glass.card} ${UI_THEMES.glass.border}`}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-400/30">
            SPEED
          </Badge>
          <span className="text-xl font-bold text-orange-400 font-mono">{(gameState.speed * 100).toFixed(0)}%</span>
        </div>
      </Card>
    </div>

    {/* Level Display (if available) */}
    {gameState.level && (
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className={`px-4 py-2 ${UI_THEMES.glass.card} ${UI_THEMES.glass.border}`}>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-400/30">
            LEVEL {gameState.level}
          </Badge>
        </Card>
      </div>
    )}
  </>
)

/**
 * 🎬 START SCREEN COMPONENT
 * Welcome screen with game title and start button
 */
const StartScreen = ({ onStartGame }: { onStartGame: () => void }) => (
  <div className={`${LAYOUT_CONFIG.modals.overlay} pointer-events-auto`}>
    <div className={LAYOUT_CONFIG.modals.center}>
      <Card className={`p-12 text-center ${UI_THEMES.glass.card} ${UI_THEMES.glass.border} max-w-md mx-4`}>
        {/* Game Title */}
        <div className="mb-8">
          <h1
            className={`text-6xl font-bold mb-4 bg-gradient-to-r ${UI_THEMES.cyberpunk.primary} bg-clip-text text-transparent ${UI_THEMES.neon.glow}`}
          >
            {CONTENT_CONFIG.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{CONTENT_CONFIG.subtitle}</p>
        </div>

        {/* Start Button */}
        <Button
          onClick={onStartGame}
          size="lg"
          className={`text-xl px-12 py-6 bg-gradient-to-r ${UI_THEMES.cyberpunk.primary} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25`}
        >
          <span className="flex items-center gap-3">⚡ START GAME</span>
        </Button>

        {/* Controls Instructions */}
        <div className="mt-8 space-y-2 text-sm text-muted-foreground">
          <p>🎮 {CONTENT_CONFIG.controls.move}</p>
          <p>🦘 {CONTENT_CONFIG.controls.jump}</p>
        </div>
      </Card>
    </div>
  </div>
)

/**
 * 💀 GAME OVER SCREEN COMPONENT
 * Results screen with final score and restart options
 */
const GameOverScreen = ({
  gameState,
  onStartGame,
  onResetGame,
}: {
  gameState: GameUIProps["gameState"]
  onStartGame: () => void
  onResetGame: () => void
}) => (
  <div className={`${LAYOUT_CONFIG.modals.overlay} pointer-events-auto`}>
    <div className={LAYOUT_CONFIG.modals.center}>
      <Card className={`p-10 text-center ${UI_THEMES.glass.card} border-red-500/30 max-w-md mx-4`}>
        {/* Game Over Title */}
        <h2
          className={`text-5xl font-bold mb-6 bg-gradient-to-r ${UI_THEMES.cyberpunk.danger} bg-clip-text text-transparent`}
        >
          {CONTENT_CONFIG.messages.gameOver}
        </h2>

        {/* Final Stats */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
            <span className="text-muted-foreground">Final Score:</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono">{gameState.score.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
            <span className="text-muted-foreground">Max Speed:</span>
            <span className="text-xl font-bold text-orange-400 font-mono">{(gameState.speed * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onStartGame}
            size="lg"
            className={`w-full bg-gradient-to-r ${UI_THEMES.cyberpunk.primary} hover:scale-105 transition-all duration-300`}
          >
            🔄 PLAY AGAIN
          </Button>

          <Button
            onClick={onResetGame}
            variant="outline"
            size="lg"
            className="w-full border-muted text-muted-foreground hover:bg-muted/20 bg-transparent"
          >
            🏠 MAIN MENU
          </Button>
        </div>
      </Card>
    </div>
  </div>
)

/**
 * 🎮 CONTROLS HINT COMPONENT
 * Shows control instructions during gameplay
 */
const ControlsHint = () => (
  <div className={`absolute ${LAYOUT_CONFIG.hud.controls} pointer-events-auto`}>
    <Card className={`px-4 py-3 ${UI_THEMES.glass.card} ${UI_THEMES.glass.border}`}>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>🎮 {CONTENT_CONFIG.controls.move}</p>
        <p>🦘 {CONTENT_CONFIG.controls.jump}</p>
      </div>
    </Card>
  </div>
)
