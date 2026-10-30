import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, X } from 'lucide-react';
import { FruitType } from '../types';

interface HeaderBarProps {
  score: number;
  highScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onRestart: () => void;
  onToggleAutoPilot: () => void;
  fruitType: FruitType;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  score,
  highScore,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onRestart,
  onToggleAutoPilot,
  fruitType,
}) => {
  return (
    <header className="relative w-full bg-[#4a752c] text-white select-none px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* 
        SECRET BUTTON IN TOP LEFT
        Invisible secret hit area in top-left corner.
      */}
      <button
        onClick={onToggleAutoPilot}
        aria-label="Google Snake Secret Trigger"
        title=""
        className="absolute top-0 left-0 w-16 h-14 z-30 cursor-pointer opacity-0 focus:outline-none"
      />

      {/* Left: Apple + Score, Trophy + High Score */}
      <div className="flex items-center gap-6 sm:gap-8 z-10">
        {/* Apple + Score */}
        <div
          onClick={onToggleAutoPilot}
          className="flex items-center gap-2.5 cursor-pointer"
          title="Current Score"
        >
          <FruitIcon type={fruitType} />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans tabular-nums">
            {score}
          </span>
        </div>

        {/* Trophy + Best Score */}
        <div className="flex items-center gap-2.5" title="High Score">
          <TrophyIcon />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans tabular-nums">
            {highScore}
          </span>
        </div>
      </div>

      {/* Right Controls matching Google Snake screenshot: Fullscreen, Sound, Close */}
      <div className="flex items-center gap-3 sm:gap-4 z-10">
        {/* Fullscreen / Corner Brackets icon */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-md text-white/90 hover:text-white hover:bg-black/15 transition-colors focus:outline-none"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
          ) : (
            <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
          )}
        </button>

        {/* Volume / Sound Toggle icon */}
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-md text-white/90 hover:text-white hover:bg-black/15 transition-colors focus:outline-none"
          title={soundEnabled ? 'Mute' : 'Unmute'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
          ) : (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 opacity-60" strokeWidth={2.4} />
          )}
        </button>

        {/* Close / Restart 'X' icon */}
        <button
          onClick={onRestart}
          className="p-1.5 rounded-md text-white/90 hover:text-white hover:bg-black/15 transition-colors focus:outline-none"
          title="Restart Game"
          aria-label="Restart Game"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.6} />
        </button>
      </div>
    </header>
  );
};

function FruitIcon({ type }: { type: FruitType }) {
  if (type === 'banana') {
    return (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M4 19C9 19 19 16 19 5C17 10 12 15 4 19Z" fill="#FBC02D" />
        <path d="M19 5L20 4" stroke="#689F38" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Exact Google Red Apple from screenshot
  return (
    <svg className="w-7 h-7 shrink-0 drop-shadow-sm" viewBox="0 0 32 32" fill="none">
      {/* Apple body */}
      <circle cx="16" cy="18" r="11" fill="#EA4335" />
      <path
        d="M16 8 C16 4 20 2 23 2 C21 6 18 8 16 8"
        fill="#34A853"
      />
      <rect x="15" y="5" width="2" height="4" rx="1" fill="#795548" />
    </svg>
  );
}

function TrophyIcon() {
  // Golden Trophy cup from Google Snake screenshot
  return (
    <svg className="w-7 h-7 shrink-0 text-[#FBBC05] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 16.9V19H8v2h8v-2h-3v-2.1a5.01 5.01 0 0 0 3.61-3.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}
