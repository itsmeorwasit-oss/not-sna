export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export type FruitType = 'apple' | 'banana' | 'orange' | 'strawberry' | 'cherry' | 'grapes' | 'watermelon';

export type SnakeColor = 
  | 'blue' 
  | 'green' 
  | 'red' 
  | 'purple' 
  | 'orange' 
  | 'yellow' 
  | 'pink' 
  | 'rainbow';

export type BoardSize = 'small' | 'normal' | 'large';

export interface BoardConfig {
  cols: number;
  rows: number;
  label: string;
}

export const BOARD_SIZES: Record<BoardSize, BoardConfig> = {
  small: { cols: 10, rows: 9, label: 'Small (10x9)' },
  normal: { cols: 17, rows: 15, label: 'Normal (17x15)' },
  large: { cols: 24, rows: 21, label: 'Large (24x21)' },
};

export type GameSpeed = 'slow' | 'normal' | 'fast';

export const SPEED_MS: Record<GameSpeed, number> = {
  slow: 180,
  normal: 135,
  fast: 100,
};

export interface GameSettings {
  fruitType: FruitType;
  snakeColor: SnakeColor;
  boardSize: BoardSize;
  speed: GameSpeed;
  fruitCount: number; // 1, 3, or 5
  soundEnabled: boolean;
}

export interface SnakeTheme {
  head: string;
  body: string;
  bodyDark: string;
  outline?: string;
}

export const SNAKE_THEMES: Record<SnakeColor, SnakeTheme> = {
  blue: {
    head: '#4573e8',
    body: '#4d80f0',
    bodyDark: '#3b67d6',
  },
  green: {
    head: '#1b9a59',
    body: '#22ad65',
    bodyDark: '#16874e',
  },
  red: {
    head: '#e53935',
    body: '#ef5350',
    bodyDark: '#c62828',
  },
  purple: {
    head: '#8e24aa',
    body: '#ab47bc',
    bodyDark: '#7b1fa2',
  },
  orange: {
    head: '#fb8c00',
    body: '#ffa726',
    bodyDark: '#f57c00',
  },
  yellow: {
    head: '#fbc02d',
    body: '#fdd835',
    bodyDark: '#f9a825',
  },
  pink: {
    head: '#d81b60',
    body: '#ec407a',
    bodyDark: '#c2185b',
  },
  rainbow: {
    head: '#ff0055',
    body: '#00ccff',
    bodyDark: '#aa00ff',
  },
};
