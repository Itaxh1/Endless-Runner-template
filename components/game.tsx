"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface GameState {
  isPlaying: boolean
  isGameOver: boolean
  score: number
  speed: number
}

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const playerRef = useRef<any>(null)
  const obstaclesRef = useRef<any[]>([])
  const groundRef = useRef<any[]>([])
  const animationRef = useRef<number | null>(null)

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    speed: 0.2,
  })

  const [playerPosition, setPlayerPosition] = useState(0) // -1, 0, 1 for left, center, right
  const [isJumping, setIsJumping] = useState(false)

  const initializeScene = useCallback(() => {
    if (!canvasRef.current) return

    const engine = new Engine(canvasRef.current, true)
    engineRef.current = engine

    const scene = new Scene(engine)
    sceneRef.current = scene

    // Camera setup
    const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene)
    camera.setTarget(new Vector3(0, 0, 10))

    // Lighting
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    const dirLight = new DirectionalLight("dirLight", new Vector3(0, -1, 1), scene)
    dirLight.intensity = 0.5

    // Create ground segments
    for (let i = 0; i < 20; i++) {
      const ground = MeshBuilder.CreateBox("ground", { width: 6, height: 0.5, depth: 10 }, scene)
      ground.position = new Vector3(0, -2, i * 10)

      const groundMaterial = new StandardMaterial("groundMat", scene)
      groundMaterial.diffuseColor = new Color3(0.3, 0.3, 0.4)
      groundMaterial.emissiveColor = new Color3(0.1, 0.1, 0.2)
      ground.material = groundMaterial

      groundRef.current.push(ground)
    }

    // Create player
    const player = MeshBuilder.CreateBox("player", { width: 1, height: 2, depth: 1 }, scene)
    player.position = new Vector3(0, 0, 0)

    const playerMaterial = new StandardMaterial("playerMat", scene)
    playerMaterial.diffuseColor = new Color3(0, 0.8, 1) // Electric blue
    playerMaterial.emissiveColor = new Color3(0, 0.2, 0.4)
    player.material = playerMaterial

    playerRef.current = player

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render()
    })

    // Handle resize
    window.addEventListener("resize", () => {
      engine.resize()
    })
  }, [])

  const createObstacle = useCallback((zPosition: number) => {
    if (!sceneRef.current) return

    const scene = sceneRef.current
    const lanes = [-2, 0, 2]
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)]

    const obstacle = MeshBuilder.CreateBox("obstacle", { width: 1, height: 3, depth: 1 }, scene)
    obstacle.position = new Vector3(randomLane, 0.5, zPosition)

    const obstacleMaterial = new StandardMaterial("obstacleMat", scene)
    obstacleMaterial.diffuseColor = new Color3(1, 0.3, 0.3) // Red
    obstacleMaterial.emissiveColor = new Color3(0.3, 0.1, 0.1)
    obstacle.material = obstacleMaterial

    obstacle.scaling = new Vector3(0.1, 0.1, 0.1)

    obstacle.metadata = { spawnTime: Date.now() }

    obstaclesRef.current.push(obstacle)
  }, [])

  const speedRef = useRef(0.2)
  const scoreRef = useRef(0)
  const isPlayingRef = useRef(false)

  const gameLoop = useCallback(() => {
    if (!isPlayingRef.current || !playerRef.current || !sceneRef.current) return

    const player = playerRef.current
    const scene = sceneRef.current

    // Move world towards player
    groundRef.current.forEach((ground) => {
      ground.position.z -= speedRef.current
      if (ground.position.z < -20) {
        ground.position.z += 200
      }
    })

    // Move obstacles
    obstaclesRef.current.forEach((obstacle, index) => {
      obstacle.position.z -= speedRef.current

      if (obstacle.metadata && obstacle.metadata.spawnTime) {
        const timeSinceSpawn = Date.now() - obstacle.metadata.spawnTime
        const scaleProgress = Math.min(timeSinceSpawn / 500, 1) // 500ms to fully scale
        const easeScale = 1 - Math.pow(1 - scaleProgress, 3) // Ease-out cubic
        obstacle.scaling = new Vector3(easeScale, easeScale, easeScale)

        if (scaleProgress >= 1) {
          obstacle.metadata.spawnTime = null // Stop scaling animation
        }
      }

      // Check collision
      const playerPos = player.position
      const obstaclePos = obstacle.position

      if (
        Math.abs(playerPos.x - obstaclePos.x) < 1.5 &&
        Math.abs(playerPos.z - obstaclePos.z) < 1.5 &&
        playerPos.y < 2 // Not jumping high enough
      ) {
        setGameState((prev) => ({ ...prev, isPlaying: false, isGameOver: true }))
        isPlayingRef.current = false
        return
      }

      // Remove obstacle if too far behind
      if (obstacle.position.z < -20) {
        obstacle.dispose()
        obstaclesRef.current.splice(index, 1)
        scoreRef.current += 10
        setGameState((prev) => ({ ...prev, score: scoreRef.current }))
      }
    })

    // Spawn new obstacles
    if (Math.random() < 0.02) {
      createObstacle(100)
    }

    // Update player position smoothly
    const targetX = playerPosition * 2
    player.position.x += (targetX - player.position.x) * 0.1

    // Handle jumping
    if (isJumping) {
      player.position.y = Math.max(0, player.position.y + 0.3)
      if (player.position.y >= 4) {
        setIsJumping(false)
      }
    } else {
      player.position.y = Math.max(0, player.position.y - 0.2)
    }

    // Increase speed over time
    speedRef.current = Math.min(speedRef.current + 0.0001, 0.5)
    setGameState((prev) => ({
      ...prev,
      speed: speedRef.current,
    }))

    if (isPlayingRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
  }, [playerPosition, isJumping, createObstacle])

  const startGame = () => {
    speedRef.current = 0.2
    scoreRef.current = 0
    isPlayingRef.current = true

    setGameState({
      isPlaying: true,
      isGameOver: false,
      score: 0,
      speed: 0.2,
    })
    setPlayerPosition(0)
    setIsJumping(false)

    // Clear existing obstacles
    obstaclesRef.current.forEach((obstacle) => obstacle.dispose())
    obstaclesRef.current = []

    // Reset player position
    if (playerRef.current) {
      playerRef.current.position = new Vector3(0, 0, 0)
    }
  }

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      isGameOver: false,
      score: 0,
      speed: 0.2,
    })

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState.isPlaying) return

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setPlayerPosition((prev) => Math.max(prev - 1, -1))
          break
        case "ArrowRight":
        case "d":
        case "D":
          setPlayerPosition((prev) => Math.min(prev + 1, 1))
          break
        case "ArrowUp":
        case " ":
        case "w":
        case "W":
          if (!isJumping) {
            setIsJumping(true)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState.isPlaying, isJumping])

  // Initialize scene on mount
  useEffect(() => {
    initializeScene()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (engineRef.current) {
        engineRef.current.dispose()
      }
    }
  }, [initializeScene])

  // Start game loop when playing
  useEffect(() => {
    if (gameState.isPlaying) {
      gameLoop()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState.isPlaying, gameLoop])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="w-full h-full" style={{ outline: "none" }} />

      {/* Game UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Score Display */}
        <div className="absolute top-8 left-8 pointer-events-auto">
          <Card className="px-6 py-3 bg-card/80 backdrop-blur-sm border-primary/20">
            <div className="score-display">Score: {gameState.score}</div>
          </Card>
        </div>

        {/* Speed Display */}
        <div className="absolute top-8 right-8 pointer-events-auto">
          <Card className="px-6 py-3 bg-card/80 backdrop-blur-sm border-accent/20">
            <div className="text-accent font-bold">Speed: {(gameState.speed * 100).toFixed(0)}%</div>
          </Card>
        </div>

        {/* Controls Info */}
        {gameState.isPlaying && (
          <div className="absolute bottom-8 left-8 pointer-events-auto">
            <Card className="px-4 py-2 bg-card/60 backdrop-blur-sm border-muted/20">
              <div className="text-sm text-muted-foreground">A/D: Move | W/Space: Jump</div>
            </Card>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <Card className="p-8 text-center pulse-glow border-destructive/50">
              <h2 className="text-4xl font-bold neon-text mb-4">Game Over!</h2>
              <p className="text-xl text-muted-foreground mb-2">Final Score: {gameState.score}</p>
              <p className="text-sm text-muted-foreground mb-6">
                You reached {(gameState.speed * 100).toFixed(0)}% speed!
              </p>
              <div className="space-y-3">
                <Button onClick={startGame} className="game-button w-full">
                  Play Again
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full border-muted text-muted-foreground hover:bg-muted/20 bg-transparent"
                >
                  Main Menu
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Start Screen */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl scale-150 animate-pulse"></div>

              <Card className="relative p-12 text-center float-animation border-primary/30 bg-card/90 backdrop-blur-md shadow-2xl">
                <div className="mb-8">
                  <h1 className="text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2 animate-pulse">
                    CYBER RUNNER
                  </h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4"></div>
                  <p className="text-xl text-muted-foreground/80 font-medium">Navigate through the digital world</p>
                  <p className="text-lg text-muted-foreground/60">Avoid obstacles and survive as long as you can!</p>
                </div>

                <div className="mb-8">
                  <Button
                    onClick={startGame}
                    className="game-button text-2xl px-12 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      START GAME
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground/70 font-medium uppercase tracking-wider">Controls</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/20 border border-muted/30">
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 text-xs bg-muted/40 rounded border">A</kbd>
                        <kbd className="px-2 py-1 text-xs bg-muted/40 rounded border">D</kbd>
                      </div>
                      <span className="text-muted-foreground">Move</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/20 border border-muted/30">
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 text-xs bg-muted/40 rounded border">W</kbd>
                        <kbd className="px-2 py-1 text-xs bg-muted/40 rounded border">Space</kbd>
                      </div>
                      <span className="text-muted-foreground">Jump</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-muted/20">
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground/60">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                      </div>
                      <div>3D Graphics</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-accent/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                      </div>
                      <div>Progressive Speed</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                      </div>
                      <div>High Score</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
