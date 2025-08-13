"use client"

import { useRef, useCallback } from "react"
import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  FreeCamera,
  DirectionalLight,
} from "@babylonjs/core"

/**
 * GAME ENGINE MODULE
 * ===================
 * This module handles all Babylon.js 3D engine operations.
 * LLMs can easily modify visual elements, lighting, and 3D objects here.
 *
 * Key customization points:
 * - VISUAL_CONFIG: Colors, materials, lighting settings
 * - WORLD_CONFIG: Ground size, obstacle spawning, camera positioning
 * - PHYSICS_CONFIG: Movement speeds, collision detection, jump mechanics
 */

// 🎨 VISUAL CONFIGURATION - Easy to modify for different themes
export const VISUAL_CONFIG = {
  // Player appearance
  player: {
    color: new Color3(0, 0.8, 1), // Electric blue
    emissive: new Color3(0, 0.2, 0.4),
    size: { width: 1, height: 2, depth: 1 },
  },

  // Obstacle appearance
  obstacle: {
    color: new Color3(1, 0.3, 0.3), // Red
    emissive: new Color3(0.3, 0.1, 0.1),
    size: { width: 1, height: 3, depth: 1 },
  },

  // Ground/Environment
  ground: {
    color: new Color3(0.3, 0.3, 0.4), // Dark gray
    emissive: new Color3(0.1, 0.1, 0.2),
    size: { width: 6, height: 0.5, depth: 10 },
  },

  // Lighting settings
  lighting: {
    ambient: { intensity: 0.7 },
    directional: { intensity: 0.5 },
  },
}

// 🌍 WORLD CONFIGURATION - Game world settings
export const WORLD_CONFIG = {
  lanes: [-2, 0, 2], // X positions for left, center, right lanes
  groundSegments: 20, // Number of ground pieces
  segmentLength: 10, // Length of each ground segment
  camera: {
    position: new Vector3(0, 5, -10),
    target: new Vector3(0, 0, 10),
  },
}

// ⚡ PHYSICS CONFIGURATION - Movement and game mechanics
export const PHYSICS_CONFIG = {
  baseSpeed: 0.2,
  maxSpeed: 0.5,
  speedIncrease: 0.0001,
  jumpHeight: 4,
  jumpSpeed: 0.3,
  fallSpeed: 0.2,
  laneChangeSpeed: 0.1,
  obstacleSpawnChance: 0.02,
  collisionDistance: 1.5,
}

export interface GameEngineRefs {
  engine: Engine | null
  scene: Scene | null
  player: any | null
  obstacles: any[]
  ground: any[]
}

/**
 * Initialize the 3D game scene with Babylon.js
 * This function sets up the entire 3D environment
 */
export const useGameEngine = () => {
  const engineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const playerRef = useRef<any>(null)
  const obstaclesRef = useRef<any[]>([])
  const groundRef = useRef<any[]>([])

  const initializeScene = useCallback((canvas: HTMLCanvasElement) => {
    // 🚀 ENGINE SETUP - Initialize Babylon.js engine
    const engine = new Engine(canvas, true)
    engineRef.current = engine

    const scene = new Scene(engine)
    sceneRef.current = scene

    // 📷 CAMERA SETUP - Position and configure the game camera
    const camera = new FreeCamera("camera", WORLD_CONFIG.camera.position, scene)
    camera.setTarget(WORLD_CONFIG.camera.target)

    // 💡 LIGHTING SETUP - Create ambient and directional lighting
    const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene)
    ambientLight.intensity = VISUAL_CONFIG.lighting.ambient.intensity

    const directionalLight = new DirectionalLight("dirLight", new Vector3(0, -1, 1), scene)
    directionalLight.intensity = VISUAL_CONFIG.lighting.directional.intensity

    // 🏗️ GROUND CREATION - Build the endless runway
    createGround(scene)

    // 🎮 PLAYER CREATION - Create the player character
    createPlayer(scene)

    // 🔄 RENDER LOOP - Start the continuous rendering
    engine.runRenderLoop(() => {
      scene.render()
    })

    // 📱 RESPONSIVE HANDLING - Handle window resize
    window.addEventListener("resize", () => {
      engine.resize()
    })

    return { engine, scene }
  }, [])

  /**
   * Create ground segments for the endless runner track
   */
  const createGround = (scene: Scene) => {
    for (let i = 0; i < WORLD_CONFIG.groundSegments; i++) {
      const ground = MeshBuilder.CreateBox("ground", VISUAL_CONFIG.ground.size, scene)
      ground.position = new Vector3(0, -2, i * WORLD_CONFIG.segmentLength)

      const groundMaterial = new StandardMaterial("groundMat", scene)
      groundMaterial.diffuseColor = VISUAL_CONFIG.ground.color
      groundMaterial.emissiveColor = VISUAL_CONFIG.ground.emissive
      ground.material = groundMaterial

      groundRef.current.push(ground)
    }
  }

  /**
   * Create the player character
   */
  const createPlayer = (scene: Scene) => {
    const player = MeshBuilder.CreateBox("player", VISUAL_CONFIG.player.size, scene)
    player.position = new Vector3(0, 0, 0)

    const playerMaterial = new StandardMaterial("playerMat", scene)
    playerMaterial.diffuseColor = VISUAL_CONFIG.player.color
    playerMaterial.emissiveColor = VISUAL_CONFIG.player.emissive
    player.material = playerMaterial

    playerRef.current = player
  }

  /**
   * Create an obstacle at specified position
   */
  const createObstacle = useCallback((zPosition: number) => {
    if (!sceneRef.current) return

    const scene = sceneRef.current
    const randomLane = WORLD_CONFIG.lanes[Math.floor(Math.random() * WORLD_CONFIG.lanes.length)]

    const obstacle = MeshBuilder.CreateBox("obstacle", VISUAL_CONFIG.obstacle.size, scene)
    obstacle.position = new Vector3(randomLane, 0.5, zPosition)

    const obstacleMaterial = new StandardMaterial("obstacleMat", scene)
    obstacleMaterial.diffuseColor = VISUAL_CONFIG.obstacle.color
    obstacleMaterial.emissiveColor = VISUAL_CONFIG.obstacle.emissive
    obstacle.material = obstacleMaterial

    obstaclesRef.current.push(obstacle)
  }, [])

  /**
   * Clean up resources when component unmounts
   */
  const cleanup = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.dispose()
    }
  }, [])

  return {
    refs: {
      engine: engineRef.current,
      scene: sceneRef.current,
      player: playerRef.current,
      obstacles: obstaclesRef.current,
      ground: groundRef.current,
    },
    initializeScene,
    createObstacle,
    cleanup,
  }
}
