import React from 'react';
import { RotateCcw, Settings } from 'lucide-react';
import { FruitType } from '../types';

interface GameOverModalProps {
  score: number;
  highScore: number;
  fruitType: FruitType;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  onRestart,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-xs bg-[#4a752c] text-white rounded-2xl p-6 shadow-2xl border-4 border-[#578a34] text-center flex flex-col items-center">
        {/* Game Over Title */}
        <h3 className="text-2xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">
          Game Over!
        </h3>

        {/* Scores Card */}
        <div className="w-full bg-[#3b5e23] rounded-xl p-4 mb-6 border border-[#31501c] flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">
              Score
            </span>
            <span className="text-3xl font-black text-white font-mono tabular-nums">
              {score}
            </span>
          </div>

          <div className="h-8 w-px bg-white/20"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider mb-1">
              Best
            </span>
            <span className="text-3xl font-black text-amber-300 font-mono tabular-nums">
              {highScore}
            </span>
          </div>
        </div>

        {/* Action Controls: Circular Replay + Settings */}
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-3.5 rounded-full bg-[#3b5e23] hover:bg-[#31501c] text-white shadow-md transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* Primary Replay Button (Signature Google Blue) */}
          <button
            onClick={onRestart}
            autoFocus
            className="p-4 rounded-full bg-[#4285f4] hover:bg-[#3367d6] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 focus:outline-none ring-4 ring-blue-400/30"
            title="Play Again (Space)"
          >
            <RotateCcw className="w-7 h-7" />
          </button>
        </div>

        <p className="mt-4 text-xs text-emerald-200/90 font-medium">
          Press <kbd className="px-1.5 py-0.5 bg-black/20 rounded font-mono text-white">Space</kbd> or click to replay
        </p>
      </div>
    </div>
  );
};
