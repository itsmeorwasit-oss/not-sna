import React, { useEffect, useRef } from 'react';
import { Point, Direction, GameStatus, FruitType, SnakeColor, SNAKE_THEMES } from '../types';

interface SnakeCanvasProps {
  cols: number;
  rows: number;
  snake: Point[];
  prevSnake: Point[];
  lastTickTime: number;
  tickInterval: number;
  direction: Direction;
  prevDirection: Direction;
  foods: Point[];
  status: GameStatus;
  fruitType: FruitType;
  snakeColor: SnakeColor;
}

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  cols,
  rows,
  snake,
  prevSnake,
  lastTickTime,
  tickInterval,
  direction,
  prevDirection,
  foods,
  status,
  fruitType,
  snakeColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const confettiParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    vRot: number;
  }>>([]);

  const stateRef = useRef({
    snake,
    prevSnake,
    lastTickTime,
    tickInterval,
    direction,
    prevDirection,
    foods,
    status,
    fruitType,
    snakeColor,
    cols,
    rows,
  });

  stateRef.current = {
    snake,
    prevSnake,
    lastTickTime,
    tickInterval,
    direction,
    prevDirection,
    foods,
    status,
    fruitType,
    snakeColor,
    cols,
    rows,
  };

  useEffect(() => {
    if (status === 'VICTORY') {
      const colors = ['#ea4335', '#4285f4', '#fbbc05', '#34a853', '#ab47bc'];
      const particles = [];
      const width = cols * 32;
      const height = rows * 32;
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * -height * 0.5,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
      confettiParticlesRef.current = particles;
    } else {
      confettiParticlesRef.current = [];
    }
  }, [status, cols, rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = (timestamp: number) => {
      if (!running) return;

      const {
        snake: currentSnake,
        prevSnake: previousSnake,
        lastTickTime: tickTime,
        tickInterval: interval,
        direction: curDir,
        prevDirection: pastDir,
        foods: curFoods,
        status: curStatus,
        fruitType: curFruit,
        snakeColor: curColor,
        cols: gridCols,
        rows: gridRows,
      } = stateRef.current;

      const cellSize = 32;
      const boardWidth = gridCols * cellSize;
      const boardHeight = gridRows * cellSize;
      const outerBorder = 18; // Thick dark green border

      const totalCanvasWidth = boardWidth + outerBorder * 2;
      const totalCanvasHeight = boardHeight + outerBorder * 2;

      // Handle HiDPI displays
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== totalCanvasWidth * dpr || canvas.height !== totalCanvasHeight * dpr) {
        canvas.width = totalCanvasWidth * dpr;
        canvas.height = totalCanvasHeight * dpr;
        canvas.style.width = `${totalCanvasWidth}px`;
        canvas.style.height = `${totalCanvasHeight}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Outer Garden Green Border Frame (#4a752c)
      ctx.fillStyle = '#4a752c';
      ctx.fillRect(0, 0, totalCanvasWidth, totalCanvasHeight);

      // 2. Draw Checkered Lawn inside border
      ctx.save();
      ctx.translate(outerBorder, outerBorder);

      for (let x = 0; x < gridCols; x++) {
        for (let y = 0; y < gridRows; y++) {
          const isEven = (x + y) % 2 === 0;
          ctx.fillStyle = isEven ? '#aad751' : '#a2d149';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }

      // 3. Draw Foods with soft grass drop shadow
      const pulse = 1 + 0.02 * Math.sin(timestamp * 0.005);
      for (const food of curFoods) {
        drawGoogleFruit(ctx, food.x * cellSize, food.y * cellSize, cellSize, curFruit, pulse);
      }

      // 4. Smooth Sub-Pixel Snake Interpolation
      let progress = 1;
      if (curStatus === 'PLAYING') {
        const elapsed = performance.now() - tickTime;
        progress = Math.min(1, Math.max(0, elapsed / Math.max(1, interval)));
      }

      if (currentSnake.length > 0) {
        const interpSnake: { x: number; y: number }[] = [];
        for (let i = 0; i < currentSnake.length; i++) {
          const curr = currentSnake[i];
          const prev = previousSnake[i] || curr;
          const ix = prev.x + (curr.x - prev.x) * progress;
          const iy = prev.y + (curr.y - prev.y) * progress;
          interpSnake.push({ x: ix, y: iy });
        }

        drawGoogleSnakeWithBigEyes(
          ctx,
          interpSnake,
          curDir,
          pastDir,
          progress,
          cellSize,
          curColor,
          curStatus,
          timestamp
        );
      }

      // 5. Confetti on victory
      if (curStatus === 'VICTORY' && confettiParticlesRef.current.length > 0) {
        for (const p of confettiParticlesRef.current) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();

          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.vRot;

          if (p.y > boardHeight) {
            p.y = -10;
            p.x = Math.random() * boardWidth;
          }
        }
      }

      ctx.restore(); // restore translate(outerBorder, outerBorder)
      ctx.restore(); // restore scale(dpr, dpr)

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center select-none bg-[#4a752c] p-0">
      <canvas
        ref={canvasRef}
        className="block cursor-default max-w-full h-auto"
        tabIndex={0}
      />
    </div>
  );
};

function drawGoogleFruit(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  size: number,
  type: FruitType,
  pulse: number = 1
) {
  const cx = px + size / 2;
  const cy = py + size / 2;
  const r = size * 0.38 * pulse;

  ctx.save();

  // Grass shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.85, r * 0.9, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  if (type === 'banana') {
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 1.1, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.lineWidth = size * 0.32;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fbc02d';
    ctx.stroke();

    ctx.fillStyle = '#689f38';
    ctx.beginPath();
    ctx.arc(cx + r * 0.7, cy + r * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Red Apple
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ea4335';
    ctx.fill();

    // Stem
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#6d4c41';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx, cy - r * 1.05);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = '#34a853';
    ctx.beginPath();
    ctx.ellipse(cx + 4.5, cy - r * 0.85, 4.5, 2.5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.35, cy - r * 0.3, 3, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws the smooth Google Snake continuous ribbon with big expressive eyes and fluid corner turns
 */
function drawGoogleSnakeWithBigEyes(
  ctx: CanvasRenderingContext2D,
  interpSnake: { x: number; y: number }[],
  direction: Direction,
  prevDirection: Direction,
  progress: number,
  cellSize: number,
  snakeColor: SnakeColor,
  status: GameStatus,
  timestamp: number
) {
  if (interpSnake.length === 0) return;

  const theme = SNAKE_THEMES[snakeColor];
  const snakeThickness = cellSize * 0.78; // Authentic ribbon thickness

  ctx.save();

  // 1. Subtle drop shadow under snake
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  const first = interpSnake[0];
  ctx.moveTo(first.x * cellSize + cellSize / 2, first.y * cellSize + cellSize / 2);
  for (let i = 1; i < interpSnake.length; i++) {
    const pt = interpSnake[i];
    ctx.lineTo(pt.x * cellSize + cellSize / 2, pt.y * cellSize + cellSize / 2);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = snakeThickness;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.stroke();
  ctx.restore();

  // 2. Draw continuous body tube
  ctx.beginPath();
  ctx.moveTo(first.x * cellSize + cellSize / 2, first.y * cellSize + cellSize / 2);
  for (let i = 1; i < interpSnake.length; i++) {
    const pt = interpSnake[i];
    ctx.lineTo(pt.x * cellSize + cellSize / 2, pt.y * cellSize + cellSize / 2);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = snakeThickness;

  if (snakeColor === 'rainbow') {
    ctx.strokeStyle = `hsl(${(timestamp * 0.06) % 360}, 90%, 55%)`;
  } else {
    ctx.strokeStyle = theme.head; // Vibrant Google Blue
  }
  ctx.stroke();

  // 3. Head Cap
  const hx = first.x * cellSize + cellSize / 2;
  const hy = first.y * cellSize + cellSize / 2;
  const headRadius = snakeThickness / 2;

  ctx.fillStyle = snakeColor === 'rainbow' ? `hsl(${(timestamp * 0.06) % 360}, 90%, 55%)` : theme.head;
  ctx.beginPath();
  ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Smooth Turn Angle Interpolation
  // Smoothly rotate head and eyes when changing direction
  const getDirAngle = (dir: Direction) => {
    switch (dir) {
      case 'RIGHT': return 0;
      case 'DOWN': return Math.PI / 2;
      case 'LEFT': return Math.PI;
      case 'UP': return -Math.PI / 2;
    }
  };

  const targetAngle = getDirAngle(direction);
  let pastAngle = getDirAngle(prevDirection);

  // Shortest angular difference
  let diff = targetAngle - pastAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const currentAngle = pastAngle + diff * progress;

  // 5. Snake Tongue (Flicks out periodically)
  const tongueProgress = (timestamp % 1600) / 1600;
  const showTongue = status === 'PLAYING' && tongueProgress > 0.82;

  if (showTongue) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(currentAngle);
    ctx.fillStyle = '#ea4335';
    ctx.strokeStyle = '#ea4335';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';

    const tLen = 10;
    const tx = headRadius;
    ctx.beginPath();
    ctx.moveTo(tx, 0);
    ctx.lineTo(tx + tLen, 0);
    ctx.lineTo(tx + tLen + 3, -2.5);
    ctx.moveTo(tx + tLen, 0);
    ctx.lineTo(tx + tLen + 3, 2.5);
    ctx.stroke();
    ctx.restore();
  }

  // 6. BIG EXPRESSIVE CARTOON EYES (Authentic to Google Snake)
  drawBigGoogleEyes(ctx, hx, hy, currentAngle, status, headRadius);

  ctx.restore();
}

/**
 * Renders Google Snake's big expressive cartoon eyes
 */
function drawBigGoogleEyes(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  angle: number,
  status: GameStatus,
  radius: number
) {
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(angle);

  // Big, bulging eyes: radius 6.8px (diameter ~14px)
  const eyeRadius = 6.8;
  const pupilRadius = 3.2;

  // Position eyes side-by-side perpendicular to movement direction
  const eyeForwardOffset = radius * 0.35;
  const eyeLateralOffset = radius * 0.48;

  const eye1 = { x: eyeForwardOffset, y: -eyeLateralOffset };
  const eye2 = { x: eyeForwardOffset, y: eyeLateralOffset };

  // 1. Draw large eye whites
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
  ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle border outline around eyes
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (status === 'GAME_OVER') {
    // Dizzy X's on collision
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 2.0;
    const xSize = 3.2;
    for (const eye of [eye1, eye2]) {
      ctx.beginPath();
      ctx.moveTo(eye.x - xSize, eye.y - xSize);
      ctx.lineTo(eye.x + xSize, eye.y + xSize);
      ctx.moveTo(eye.x + xSize, eye.y - xSize);
      ctx.lineTo(eye.x - xSize, eye.y + xSize);
      ctx.stroke();
    }
  } else {
    // Big dark pupils looking forward in travel direction
    const pupilShiftX = 2.4;
    ctx.fillStyle = '#202124';
    ctx.beginPath();
    ctx.arc(eye1.x + pupilShiftX, eye1.y, pupilRadius, 0, Math.PI * 2);
    ctx.arc(eye2.x + pupilShiftX, eye2.y, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white catchlight dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1.x + pupilShiftX - 1.0, eye1.y - 1.0, 1.2, 0, Math.PI * 2);
    ctx.arc(eye2.x + pupilShiftX - 1.0, eye2.y - 1.0, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
