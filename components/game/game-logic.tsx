"use client"

import { useRef, useCallback } from "react"
import { PHYSICS_CONFIG } from "./game-engine"

/**
 * GAME LOGIC MODULE
 * ==================
 * This module handles all game mechanics, physics, and state management.
 * LLMs can easily modify game rules, scoring, difficulty progression here.
 *
 * Key customization points:
 * - GAME_RULES: Scoring system, difficulty progression, win/lose conditions
 * - MOVEMENT_SYSTEM: Player controls, physics, collision detection
 * - OBSTACLE_SYSTEM: Spawning patterns, types, behaviors
 */

// 🎯 GAME RULES CONFIGURATION - Easy to modify game mechanics
export const GAME_RULES = {
  scoring: {
    pointsPerObstacle: 10,
    speedBonusMultiplier: 1.5,
    perfectRunBonus: 50,
  },

  difficulty: {
    speedIncreaseRate: PHYSICS_CONFIG.speedIncrease,
    obstacleSpawnIncrease: 0.0001,
    maxDifficulty: 0.05,
  },

  collision: {
    tolerance: PHYSICS_CONFIG.collisionDistance,
    jumpSafeHeight: 2,
  },
}

export interface GameState {
  isPlaying: boolean
  isGameOver: boolean
  score: number
  speed: number
  level: number
  perfectRun: number
}

export interface PlayerState {
  position: number // -1, 0, 1 for left, center, right
  isJumping: boolean
  jumpHeight: number
}

/**
 * Custom hook for managing game logic and physics
 */
export const useGameLogic = () => {
  // 📊 GAME STATE REFS - Use refs for values that need to persist across renders
  const speedRef = useRef(PHYSICS_CONFIG.baseSpeed)
  const scoreRef = useRef(0)
  const isPlayingRef = useRef(false)
  const animationRef = useRef<number | null>(null)
  const perfectRunRef = useRef(0)

  /**
   * 🎮 MAIN GAME LOOP
   * This function runs every frame and handles all game physics and logic
   */
  const gameLoop = useCallback(
    (
      playerRef: any,
      obstaclesRef: any[],
      groundRef: any[],
      playerState: PlayerState,
      onGameOver: () => void,
      onScoreUpdate: (score: number, speed: number) => void,
    ) => {
      // Exit if game is not playing or refs are not available
      if (!isPlayingRef.current || !playerRef || !obstaclesRef || !groundRef) return

      const player = playerRef

      // 🌍 WORLD MOVEMENT - Move the world towards the player
      moveWorld(groundRef, obstaclesRef)

      // 🚶 PLAYER MOVEMENT - Handle player position and jumping
      updatePlayerMovement(player, playerState)

      // 💥 COLLISION DETECTION - Check for collisions with obstacles
      if (checkCollisions(player, obstaclesRef, playerState)) {
        isPlayingRef.current = false
        onGameOver()
        return
      }

      // 🗑️ CLEANUP & SCORING - Remove passed obstacles and update score
      cleanupObstacles(obstaclesRef, onScoreUpdate)

      // 📈 DIFFICULTY PROGRESSION - Increase game speed over time
      updateDifficulty()

      // 🔄 CONTINUE LOOP - Schedule next frame
      if (isPlayingRef.current) {
        animationRef.current = requestAnimationFrame(() =>
          gameLoop(playerRef, obstaclesRef, groundRef, playerState, onGameOver, onScoreUpdate),
        )
      }
    },
    [],
  )

  /**
   * Move the world (ground and obstacles) towards the player
   */
  const moveWorld = (groundRef: any[], obstaclesRef: any[]) => {
    // Move ground segments
    groundRef.forEach((ground) => {
      ground.position.z -= speedRef.current
      // Reset ground position when it goes too far behind
      if (ground.position.z < -20) {
        ground.position.z += 200
      }
    })

    // Move obstacles
    obstaclesRef.forEach((obstacle) => {
      obstacle.position.z -= speedRef.current
    })
  }

  /**
   * Update player position and jumping mechanics
   */
  const updatePlayerMovement = (player: any, playerState: PlayerState) => {
    // 🏃 LANE SWITCHING - Smooth movement between lanes
    const targetX = playerState.position * 2
    player.position.x += (targetX - player.position.x) * PHYSICS_CONFIG.laneChangeSpeed

    // 🦘 JUMPING MECHANICS - Handle jump physics
    if (playerState.isJumping) {
      player.position.y = Math.max(0, player.position.y + PHYSICS_CONFIG.jumpSpeed)
    } else {
      player.position.y = Math.max(0, player.position.y - PHYSICS_CONFIG.fallSpeed)
    }
  }

  /**
   * Check for collisions between player and obstacles
   */
  const checkCollisions = (player: any, obstaclesRef: any[], playerState: PlayerState): boolean => {
    const playerPos = player.position

    return obstaclesRef.some((obstacle) => {
      const obstaclePos = obstacle.position

      // Check if player and obstacle are in same lane and close enough
      const sameXPosition = Math.abs(playerPos.x - obstaclePos.x) < GAME_RULES.collision.tolerance
      const sameZPosition = Math.abs(playerPos.z - obstaclePos.z) < GAME_RULES.collision.tolerance
      const notJumpingHigh = playerPos.y < GAME_RULES.collision.jumpSafeHeight

      return sameXPosition && sameZPosition && notJumpingHigh
    })
  }

  /**
   * Clean up obstacles that have passed and update score
   */
  const cleanupObstacles = (obstaclesRef: any[], onScoreUpdate: (score: number, speed: number) => void) => {
    obstaclesRef.forEach((obstacle, index) => {
      if (obstacle.position.z < -20) {
        obstacle.dispose()
        obstaclesRef.splice(index, 1)

        // 🎯 SCORING SYSTEM - Award points for avoiding obstacles
        scoreRef.current += GAME_RULES.scoring.pointsPerObstacle
        perfectRunRef.current += 1

        // Bonus points for perfect runs
        if (perfectRunRef.current % 10 === 0) {
          scoreRef.current += GAME_RULES.scoring.perfectRunBonus
        }

        onScoreUpdate(scoreRef.current, speedRef.current)
      }
    })
  }

  /**
   * Update game difficulty by increasing speed
   */
  const updateDifficulty = () => {
    speedRef.current = Math.min(speedRef.current + GAME_RULES.difficulty.speedIncreaseRate, PHYSICS_CONFIG.maxSpeed)
  }

  /**
   * 🎬 START GAME - Initialize game state and begin playing
   */
  const startGame = () => {
    speedRef.current = PHYSICS_CONFIG.baseSpeed
    scoreRef.current = 0
    perfectRunRef.current = 0
    isPlayingRef.current = true
  }

  /**
   * 🛑 STOP GAME - End the current game session
   */
  const stopGame = () => {
    isPlayingRef.current = false
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  /**
   * 🔄 RESET GAME - Reset all game state to initial values
   */
  const resetGame = () => {
    stopGame()
    speedRef.current = PHYSICS_CONFIG.baseSpeed
    scoreRef.current = 0
    perfectRunRef.current = 0
  }

  return {
    gameLoop,
    startGame,
    stopGame,
    resetGame,
    refs: {
      speed: speedRef,
      score: scoreRef,
      isPlaying: isPlayingRef,
      animation: animationRef,
    },
  }
}
