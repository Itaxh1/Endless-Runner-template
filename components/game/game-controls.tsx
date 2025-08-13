"use client"

import { useEffect, useCallback } from "react"

/**
 * GAME CONTROLS MODULE
 * =====================
 * This module handles all user input and control schemes.
 * LLMs can easily modify controls, add new input methods, or create custom control schemes.
 *
 * Key customization points:
 * - CONTROL_SCHEMES: Different input mappings (WASD, arrows, gamepad, touch)
 * - INPUT_HANDLERS: Custom logic for different input types
 * - ACCESSIBILITY: Alternative input methods and customization options
 */

// 🎮 CONTROL CONFIGURATION - Easy to modify input mappings
export const CONTROL_SCHEMES = {
  // Standard keyboard controls
  keyboard: {
    moveLeft: ["ArrowLeft", "a", "A"],
    moveRight: ["ArrowRight", "d", "D"],
    jump: ["ArrowUp", " ", "w", "W"], // Space and W for jump
    pause: ["Escape", "p", "P"],
    restart: ["r", "R"],
  },

  // Alternative control scheme
  alternative: {
    moveLeft: ["q", "Q"],
    moveRight: ["e", "E"],
    jump: ["Space", "ArrowUp"],
    pause: ["Escape"],
    restart: ["Enter"],
  },
}

// 📱 TOUCH CONTROLS - For mobile devices
export const TOUCH_CONFIG = {
  swipeThreshold: 50, // Minimum distance for swipe detection
  tapThreshold: 200, // Maximum time for tap detection
  zones: {
    left: { x: 0, y: 0, width: 0.33, height: 1 }, // Left third of screen
    right: { x: 0.67, y: 0, width: 0.33, height: 1 }, // Right third of screen
    jump: { x: 0.33, y: 0, width: 0.34, height: 1 }, // Middle third of screen
  },
}

export interface ControlActions {
  onMoveLeft: () => void
  onMoveRight: () => void
  onJump: () => void
  onPause?: () => void
  onRestart?: () => void
}

export interface ControlState {
  isEnabled: boolean
  scheme: keyof typeof CONTROL_SCHEMES
}

/**
 * 🎮 MAIN CONTROLS HOOK
 * Handles all input detection and action dispatching
 */
export const useGameControls = (
  actions: ControlActions,
  controlState: ControlState = { isEnabled: true, scheme: "keyboard" },
) => {
  /**
   * 🔧 KEYBOARD INPUT HANDLER
   * Processes keyboard events and maps them to game actions
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!controlState.isEnabled) return

      const scheme = CONTROL_SCHEMES[controlState.scheme]

      // Prevent default behavior for game keys
      if (Object.values(scheme).flat().includes(event.key)) {
        event.preventDefault()
      }

      // 🏃 MOVEMENT CONTROLS
      if (scheme.moveLeft.includes(event.key)) {
        actions.onMoveLeft()
      } else if (scheme.moveRight.includes(event.key)) {
        actions.onMoveRight()
      }

      // 🦘 JUMP CONTROL
      else if (scheme.jump.includes(event.key)) {
        actions.onJump()
      }

      // ⏸️ PAUSE CONTROL
      else if (scheme.pause.includes(event.key) && actions.onPause) {
        actions.onPause()
      }

      // 🔄 RESTART CONTROL
      else if (scheme.restart.includes(event.key) && actions.onRestart) {
        actions.onRestart()
      }
    },
    [actions, controlState],
  )

  /**
   * 📱 TOUCH INPUT HANDLER
   * Processes touch events for mobile gameplay
   */
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!controlState.isEnabled) return

      const touch = event.touches[0]
      const rect = (event.target as HTMLElement).getBoundingClientRect()

      // Calculate relative touch position (0-1)
      const relativeX = (touch.clientX - rect.left) / rect.width
      const relativeY = (touch.clientY - rect.top) / rect.height

      // 🎯 ZONE DETECTION - Determine which control zone was touched
      if (relativeX < TOUCH_CONFIG.zones.left.width) {
        actions.onMoveLeft()
      } else if (relativeX > TOUCH_CONFIG.zones.right.x) {
        actions.onMoveRight()
      } else {
        actions.onJump()
      }
    },
    [actions, controlState],
  )

  /**
   * 🎮 GAMEPAD INPUT HANDLER (Future Enhancement)
   * Placeholder for gamepad support
   */
  const handleGamepadInput = useCallback(() => {
    // TODO: Implement gamepad support
    // This is where LLMs can easily add gamepad functionality
    const gamepads = navigator.getGamepads()
    // Process gamepad input...
  }, [])

  // 🔗 EVENT LISTENERS SETUP
  useEffect(() => {
    if (!controlState.isEnabled) return

    // Add keyboard listeners
    window.addEventListener("keydown", handleKeyDown)

    // Add touch listeners for mobile
    window.addEventListener("touchstart", handleTouchStart, { passive: false })

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("touchstart", handleTouchStart)
    }
  }, [handleKeyDown, handleTouchStart, controlState.isEnabled])

  return {
    // Expose control scheme for UI display
    currentScheme: CONTROL_SCHEMES[controlState.scheme],

    // Methods to change control settings
    setControlScheme: (scheme: keyof typeof CONTROL_SCHEMES) => {
      // This would update the control state
      // Implementation depends on parent component state management
    },

    // Enable/disable controls
    setEnabled: (enabled: boolean) => {
      // This would update the enabled state
      // Implementation depends on parent component state management
    },
  }
}

/**
 * 🎮 CONTROL DISPLAY COMPONENT
 * Shows current control scheme to the user
 */
export const ControlsDisplay = ({
  scheme = "keyboard",
}: {
  scheme?: keyof typeof CONTROL_SCHEMES
}) => {
  const controls = CONTROL_SCHEMES[scheme]

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Move:</span>
        <code className="px-2 py-1 bg-muted rounded text-xs">
          {controls.moveLeft[0]} / {controls.moveRight[0]}
        </code>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Jump:</span>
        <code className="px-2 py-1 bg-muted rounded text-xs">{controls.jump[0]}</code>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Pause:</span>
        <code className="px-2 py-1 bg-muted rounded text-xs">{controls.pause[0]}</code>
      </div>
    </div>
  )
}
