import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Point,
  Direction,
  GameStatus,
  GameSettings,
  BOARD_SIZES,
  SPEED_MS,
} from './types';
import { SnakeSolver } from './solver/snakeSolver';
import { sounds } from './audio/soundEffects';
import { SnakeCanvas } from './components/SnakeCanvas';
import { HeaderBar } from './components/HeaderBar';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryCertificateModal } from './components/VictoryCertificateModal';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const INITIAL_SETTINGS: GameSettings = {
  fruitType: 'apple',
  snakeColor: 'blue',
  boardSize: 'normal',
  speed: 'normal',
  fruitCount: 1,
  soundEnabled: true,
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('google_snake_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const boardConfig = BOARD_SIZES[settings.boardSize];
  const { cols, rows } = boardConfig;

  // Game state
  const [snake, setSnake] = useState<Point[]>([
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 },
  ]);
  const [prevSnake, setPrevSnake] = useState<Point[]>([
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 },
  ]);
  const [lastTickTime, setLastTickTime] = useState<number>(() => performance.now());
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [prevDirection, setPrevDirection] = useState<Direction>('RIGHT');
  const [foods, setFoods] = useState<Point[]>([{ x: 4, y: 5 }]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('google_snake_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Secret Auto-Pilot Solver state
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(false);

  // Refs for loop execution to avoid stale closures
  const snakeRef = useRef<Point[]>(snake);
  snakeRef.current = snake;

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

  const nextDirectionRef = useRef<Direction>(direction);
  const foodsRef = useRef<Point[]>(foods);
  foodsRef.current = foods;

  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;

  const isAutoPilotRef = useRef<boolean>(isAutoPilot);
  isAutoPilotRef.current = isAutoPilot;

  const solverRef = useRef<SnakeSolver>(new SnakeSolver(cols, rows));

  // Sync sound setting with SoundEngine
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Update solver when board dimensions change
  useEffect(() => {
    solverRef.current.updateDimensions(cols, rows);
    resetGame(false);
  }, [cols, rows]);

  // Save settings to localStorage
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('google_snake_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  /**
   * Generates a random food location not on the snake body or other fruits
   */
  const spawnFood = useCallback((currentSnake: Point[], existingFoods: Point[] = []): Point | null => {
    const occupied = new Set([
      ...currentSnake.map((p) => `${p.x},${p.y}`),
      ...existingFoods.map((p) => `${p.x},${p.y}`),
    ]);

    const emptySlots: Point[] = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (!occupied.has(`${x},${y}`)) {
          emptySlots.push({ x, y });
        }
      }
    }

    if (emptySlots.length === 0) return null;
    return emptySlots[Math.floor(Math.random() * emptySlots.length)];
  }, [cols, rows]);

  /**
   * Resets the game to initial state
   */
  const resetGame = useCallback((autoStart: boolean = false) => {
    const startY = Math.floor(rows / 2);
    const startSnake = [
      { x: 7, y: startY },
      { x: 6, y: startY },
      { x: 5, y: startY },
    ];
    setSnake(startSnake);
    setPrevSnake(startSnake);
    setLastTickTime(performance.now());
    setDirection('RIGHT');
    setPrevDirection('RIGHT');
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    setScore(0);

    // Randomize solver cycle to ensure a fresh, random pattern every game
    solverRef.current.randomizeCycle();

    // Spawn requested number of fruits
    const initialFoods: Point[] = [];
    for (let i = 0; i < settings.fruitCount; i++) {
      const f = spawnFood(startSnake, initialFoods);
      if (f) initialFoods.push(f);
    }
    setFoods(initialFoods);

    setStatus(autoStart ? 'PLAYING' : 'IDLE');
  }, [rows, settings.fruitCount, spawnFood]);

  /**
   * Toggles Secret Auto-Pilot Mode
   */
  const toggleAutoPilot = useCallback(() => {
    setIsAutoPilot((prev) => {
      const nextVal = !prev;
      sounds.playSecretToggle(nextVal);

      if (nextVal) {
        // If game is idle or ended, restart immediately in auto-pilot
        if (statusRef.current === 'IDLE' || statusRef.current === 'GAME_OVER' || statusRef.current === 'VICTORY') {
          resetGame(true);
        }
      }
      return nextVal;
    });
  }, [resetGame]);

  /**
   * Main Game Engine Tick
   */
  const gameTick = useCallback(() => {
    if (statusRef.current !== 'PLAYING') return;

    let moveDir = nextDirectionRef.current;

    // If Secret Auto-Pilot is active, solver calculates next 100% safe move
    if (isAutoPilotRef.current || solverRef.current.forceCrash) {
      const aiMove = solverRef.current.getNextMove(snakeRef.current, foodsRef.current);
      if (aiMove) {
        moveDir = aiMove;
        nextDirectionRef.current = aiMove;
      }
    }

    // Play authentic Google Snake turn sound whenever direction changes
    if (moveDir !== directionRef.current) {
      sounds.playTurn();
    }

    setPrevDirection(directionRef.current);
    setDirection(moveDir);
    directionRef.current = moveDir;

    const currentSnake = snakeRef.current;
    const head = currentSnake[0];

    // Compute new head
    let nextHead: Point = { ...head };
    if (moveDir === 'UP') nextHead.y -= 1;
    else if (moveDir === 'DOWN') nextHead.y += 1;
    else if (moveDir === 'LEFT') nextHead.x -= 1;
    else if (moveDir === 'RIGHT') nextHead.x += 1;

    // 1. Collision check: Boundary Wall
    if (nextHead.x < 0 || nextHead.x >= cols || nextHead.y < 0 || nextHead.y >= rows) {
      handleGameOver();
      return;
    }

    // 2. Collision check: Self collision (excluding tail if not eating)
    const isEatingFruit = foodsRef.current.some(
      (f) => f.x === nextHead.x && f.y === nextHead.y
    );
    const bodyToCheck = isEatingFruit
      ? currentSnake
      : currentSnake.slice(0, -1);

    if (bodyToCheck.some((p) => p.x === nextHead.x && p.y === nextHead.y)) {
      handleGameOver();
      return;
    }

    // 3. Move Snake
    const newSnake = [nextHead, ...currentSnake];

    if (isEatingFruit) {
      sounds.playEat();

      // Remove eaten fruit and spawn new one
      const remainingFoods = foodsRef.current.filter(
        (f) => !(f.x === nextHead.x && f.y === nextHead.y)
      );
      const newFood = spawnFood(newSnake, remainingFoods);
      const updatedFoods = newFood ? [...remainingFoods, newFood] : remainingFoods;
      setFoods(updatedFoods);

      // Score update
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('google_snake_high_score', newScore.toString());
        } catch {}
      }

      // 4. Victory check: Board filled!
      const totalCells = cols * rows;
      if (newSnake.length >= totalCells) {
        sounds.playWin();
        setStatus('VICTORY');
        return;
      }
    } else {
      // Remove tail
      newSnake.pop();
    }

    setPrevSnake(currentSnake);
    setSnake(newSnake);
    setLastTickTime(performance.now());
  }, [cols, rows, score, highScore, spawnFood]);

  const handleGameOver = () => {
    sounds.playDie();
    setStatus('GAME_OVER');
  };

  /**
   * Main game loop interval: relaxed, smooth Google Snake pace
   */
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const baseSpeed = SPEED_MS[settings.speed];
    const intervalId = setInterval(gameTick, baseSpeed);
    return () => clearInterval(intervalId);
  }, [status, settings.speed, gameTick]);

  /**
   * Keyboard controls listener
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret shortcut: '`' (backtick) or 'p' also toggles auto-complete
      if (e.key === '`' || e.key.toLowerCase() === 'p') {
        if (!e.metaKey && !e.ctrlKey) {
          toggleAutoPilot();
          return;
        }
      }

      // Intentional Crash shortcut: 'c' or 'x'
      if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'x') {
        if (!e.metaKey && !e.ctrlKey) {
          solverRef.current.forceCrash = true;
          return;
        }
      }

      // Space: Start on IDLE or Restart on Game Over (no pause feature)
      if (e.code === 'Space') {
        e.preventDefault();
        if (statusRef.current === 'IDLE' || statusRef.current === 'GAME_OVER' || statusRef.current === 'VICTORY') {
          resetGame(true);
        }
        return;
      }

      // Direction keys (Arrows and WASD)
      let newDir: Direction | null = null;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') newDir = 'UP';
      else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') newDir = 'DOWN';
      else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') newDir = 'LEFT';
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') newDir = 'RIGHT';

      if (newDir) {
        e.preventDefault();

        // Start game if idle
        if (statusRef.current === 'IDLE') {
          setStatus('PLAYING');
        }

        const curr = directionRef.current;
        // Prevent 180-degree self reversal
        const isOpposite =
          (newDir === 'UP' && curr === 'DOWN') ||
          (newDir === 'DOWN' && curr === 'UP') ||
          (newDir === 'LEFT' && curr === 'RIGHT') ||
          (newDir === 'RIGHT' && curr === 'LEFT');

        if (!isOpposite) {
          nextDirectionRef.current = newDir;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame, toggleAutoPilot]);

  // Touch button handler
  const handleDirectionPress = (newDir: Direction) => {
    if (statusRef.current === 'IDLE') {
      setStatus('PLAYING');
    }
    const curr = directionRef.current;
    const isOpposite =
      (newDir === 'UP' && curr === 'DOWN') ||
      (newDir === 'DOWN' && curr === 'UP') ||
      (newDir === 'LEFT' && curr === 'RIGHT') ||
      (newDir === 'RIGHT' && curr === 'LEFT');

    if (!isOpposite) {
      nextDirectionRef.current = newDir;
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 sm:p-4 font-sans select-none overflow-hidden">
      {/* Google Snake Window matching screenshot exactly */}
      <main className="flex flex-col items-center justify-center shadow-2xl">
        <div className="bg-[#4a752c] overflow-hidden flex flex-col items-center border border-[#3b5e23]">
          {/* Header Bar matching screenshot: Apple Score, Trophy Score, Fullscreen, Volume, Close */}
          <HeaderBar
            score={score}
            highScore={highScore}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onRestart={() => resetGame(true)}
            onToggleAutoPilot={toggleAutoPilot}
            fruitType={settings.fruitType}
          />

          {/* Canvas Playing Board with Garden Green outer border */}
          <div
            onClick={() => {
              if (status === 'IDLE') setStatus('PLAYING');
            }}
            className="relative flex justify-center bg-[#4a752c] cursor-pointer"
          >
            <SnakeCanvas
              cols={cols}
              rows={rows}
              snake={snake}
              prevSnake={prevSnake}
              lastTickTime={lastTickTime}
              tickInterval={SPEED_MS[settings.speed]}
              direction={direction}
              prevDirection={prevDirection}
              foods={foods}
              status={status}
              fruitType={settings.fruitType}
              snakeColor={settings.snakeColor}
            />

            {/* Game Over Modal */}
            {status === 'GAME_OVER' && (
              <GameOverModal
                score={score}
                highScore={highScore}
                fruitType={settings.fruitType}
                onRestart={() => resetGame(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {/* Victory Modal (Full Board Auto-Completed with Certificate of Achievement) */}
            {status === 'VICTORY' && (
              <VictoryCertificateModal
                score={score}
                totalCells={cols * rows}
                onRestart={() => resetGame(true)}
              />
            )}
          </div>
        </div>

        {/* Mobile On-Screen D-Pad Controls */}
        <div className="mt-3 flex flex-col items-center sm:hidden select-none">
          <button
            onClick={() => handleDirectionPress('UP')}
            className="p-3 bg-[#3b5e23] active:bg-[#31501c] text-white rounded-xl shadow-md mb-1"
            aria-label="Move Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => handleDirectionPress('LEFT')}
              className="p-3 bg-[#3b5e23] active:bg-[#31501c] text-white rounded-xl shadow-md"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDirectionPress('DOWN')}
              className="p-3 bg-[#3b5e23] active:bg-[#31501c] text-white rounded-xl shadow-md"
              aria-label="Move Down"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDirectionPress('RIGHT')}
              className="p-3 bg-[#3b5e23] active:bg-[#31501c] text-white rounded-xl shadow-md"
              aria-label="Move Right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentic Quiet Footer */}
        <footer className="mt-4 text-center text-xs text-white/50">
          <p>
            Use <span className="font-semibold text-white">Arrow Keys</span> or <span className="font-semibold text-white">WASD</span> to move
          </p>
        </footer>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 
        SUPER SMALL DARK BLUE CRASH BUTTON IN THE BLACK BOTTOM-RIGHT CORNER
        Allows triggering an intentional crash into a wall or body for realistic human play.
      */}
      <button
        onClick={() => {
          solverRef.current.forceCrash = true;
        }}
        title="Intentional Crash"
        aria-label="Crash snake"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#1e3a8a] hover:bg-[#1d4ed8] active:scale-75 transition-all shadow-md z-40 cursor-pointer border border-[#2563eb]/40 focus:outline-none"
      />
    </div>
  );
}
