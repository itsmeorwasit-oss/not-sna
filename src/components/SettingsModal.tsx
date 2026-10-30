import React from 'react';
import { X, Check } from 'lucide-react';
import { GameSettings, FruitType, SnakeColor, BoardSize, GameSpeed, SNAKE_THEMES, BOARD_SIZES } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const fruits: { type: FruitType; label: string; emoji: string }[] = [
    { type: 'apple', label: 'Apple', emoji: '🍎' },
    { type: 'banana', label: 'Banana', emoji: '🍌' },
    { type: 'orange', label: 'Orange', emoji: '🍊' },
    { type: 'strawberry', label: 'Strawberry', emoji: '🍓' },
    { type: 'cherry', label: 'Cherry', emoji: '🍒' },
    { type: 'grapes', label: 'Grapes', emoji: '🍇' },
    { type: 'watermelon', label: 'Watermelon', emoji: '🍉' },
  ];

  const colors: { type: SnakeColor; label: string; preview: string }[] = [
    { type: 'blue', label: 'Google Blue', preview: SNAKE_THEMES.blue.head },
    { type: 'green', label: 'Meadow Green', preview: SNAKE_THEMES.green.head },
    { type: 'red', label: 'Ruby Red', preview: SNAKE_THEMES.red.head },
    { type: 'purple', label: 'Royal Purple', preview: SNAKE_THEMES.purple.head },
    { type: 'orange', label: 'Citrus Orange', preview: SNAKE_THEMES.orange.head },
    { type: 'yellow', label: 'Golden Honey', preview: SNAKE_THEMES.yellow.head },
    { type: 'pink', label: 'Berry Pink', preview: SNAKE_THEMES.pink.head },
    { type: 'rainbow', label: 'Rainbow Pulse', preview: 'linear-gradient(135deg, #ff0055, #00ccff, #aa00ff)' },
  ];

  const boardSizes: BoardSize[] = ['small', 'normal', 'large'];
  const speeds: { type: GameSpeed; label: string }[] = [
    { type: 'slow', label: 'Slow (Casual)' },
    { type: 'normal', label: 'Normal' },
    { type: 'fast', label: 'Fast (Pro)' },
  ];
  const fruitCounts = [1, 3, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#4a752c] text-white rounded-2xl shadow-2xl border-4 border-[#578a34] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#3b5e23] border-b border-[#31501c] flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Game Settings</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Fruit Selection */}
          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-2.5">
              Fruit Item
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {fruits.map((f) => (
                <button
                  key={f.type}
                  onClick={() => onUpdateSettings({ fruitType: f.type })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                    settings.fruitType === f.type
                      ? 'bg-[#a2d149] text-slate-900 border-white shadow-md scale-105'
                      : 'bg-black/15 text-white border-transparent hover:bg-black/25'
                  }`}
                  title={f.label}
                >
                  <span className="text-2xl mb-1">{f.emoji}</span>
                  <span className="text-[10px] font-semibold truncate w-full text-center">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Snake Color */}
          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-2.5">
              Snake Color
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.type}
                  onClick={() => onUpdateSettings({ snakeColor: c.type })}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all border ${
                    settings.snakeColor === c.type
                      ? 'bg-black/30 border-white ring-2 ring-amber-300'
                      : 'bg-black/15 border-transparent hover:bg-black/25'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 shadow-xs flex items-center justify-center"
                    style={{ background: c.preview }}
                  >
                    {settings.snakeColor === c.type && <Check className="w-3 h-3 text-white drop-shadow-md" />}
                  </span>
                  <span className="text-xs font-medium truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Board Size */}
          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-2.5">
              Board Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {boardSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ boardSize: size })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
                    settings.boardSize === size
                      ? 'bg-[#aad751] text-slate-900 border-white shadow-sm'
                      : 'bg-black/15 text-white border-transparent hover:bg-black/25'
                  }`}
                >
                  {BOARD_SIZES[size].label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Speed */}
          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-2.5">
              Snake Speed
            </label>
            <div className="grid grid-cols-3 gap-2">
              {speeds.map((s) => (
                <button
                  key={s.type}
                  onClick={() => onUpdateSettings({ speed: s.type })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
                    settings.speed === s.type
                      ? 'bg-[#aad751] text-slate-900 border-white shadow-sm'
                      : 'bg-black/15 text-white border-transparent hover:bg-black/25'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Count */}
          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-2.5">
              Simultaneous Fruit Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {fruitCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => onUpdateSettings({ fruitCount: count })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
                    settings.fruitCount === count
                      ? 'bg-[#aad751] text-slate-900 border-white shadow-sm'
                      : 'bg-black/15 text-white border-transparent hover:bg-black/25'
                  }`}
                >
                  {count} {count === 1 ? 'Fruit' : 'Fruits'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#3b5e23] border-t border-[#31501c] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#aad751] hover:bg-[#b8e45f] text-slate-900 font-bold text-sm rounded-xl transition-colors shadow-md"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
