import React, { useState, useRef } from 'react';
import { Download, RotateCcw, Award, Check } from 'lucide-react';

interface VictoryCertificateModalProps {
  score: number;
  totalCells: number;
  onRestart: () => void;
}

export const VictoryCertificateModal: React.FC<VictoryCertificateModalProps> = ({
  score,
  totalCells,
  onRestart,
}) => {
  const [recipientName, setRecipientName] = useState<string>('Grandmaster');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleDownload = () => {
    setIsDownloading(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    const name = recipientName.trim() || 'Snake Grandmaster';

    // 1. Parchment Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
    bgGrad.addColorStop(0, '#fdfbf5');
    bgGrad.addColorStop(0.5, '#fbf8eb');
    bgGrad.addColorStop(1, '#f7f2dd');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1130);

    // Subtle paper grain/vignette
    ctx.fillStyle = 'rgba(180, 140, 50, 0.03)';
    ctx.fillRect(0, 0, 1600, 1130);

    // 2. Ornate Double Gold & Navy Borders
    ctx.strokeStyle = '#1e3a8a'; // Deep Navy
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 1520, 1050);

    ctx.strokeStyle = '#d97706'; // Rich Gold
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1480, 1010);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.strokeRect(70, 70, 1460, 990);

    // Corner Ornaments
    const drawCorner = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI / 2);
      ctx.stroke();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(18, 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCorner(85, 85, 0);
    drawCorner(1515, 85, Math.PI / 2);
    drawCorner(1515, 1045, Math.PI);
    drawCorner(85, 1045, -Math.PI / 2);

    // 3. Header Seal / Emblem
    const sealX = 800;
    const sealY = 180;
    const sealR = 52;

    // Golden Seal Starburst
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    const spikes = 24;
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? sealR + 8 : sealR - 2;
      const angle = (i * Math.PI) / spikes;
      const x = sealX + Math.cos(angle) * radius;
      const y = sealY + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Seal inner ring
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealR - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ 252 ★', sealX, sealY);
    ctx.restore();

    // 4. Certificate Title
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 44px "Plus Jakarta Sans", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 800, 300);

    // Subtitle
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('GOOGLE SNAKE GRANDMASTER HONORS', 800, 345);

    // "THIS IS PROUDLY PRESENTED TO"
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('This is proudly presented to', 800, 420);

    // 5. Recipient Name in Grand Elegant Serif
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(name, 800, 520);

    // Name underline flourish
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 545);
    ctx.lineTo(1250, 545);
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(800, 545, 6, 0, Math.PI * 2);
    ctx.fill();

    // 6. Achievement Citation
    ctx.fillStyle = '#334155';
    ctx.font = '24px Georgia, serif';
    ctx.fillText(
      `For exhibiting flawless precision, strategy, and patience in conquering`,
      800,
      620
    );
    ctx.fillText(
      `all ${totalCells} cells of the Google Snake board with an undisputed Perfect Score of ${score}.`,
      800,
      665
    );

    // 7. Signatures and Date lines
    const lineY = 870;

    // Date (Left)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, lineY);
    ctx.lineTo(550, lineY);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(formattedDate, 400, lineY - 12);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DATE AWARDED', 400, lineY + 28);

    // Official Seal Ribbon (Center)
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('★ 100% BOARD COMPLETION ★', 800, lineY - 8);
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('Official Game Verification', 800, lineY + 24);

    // Commissioner Signature (Right)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1050, lineY);
    ctx.lineTo(1350, lineY);
    ctx.stroke();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic bold 26px "Brush Script MT", Georgia, cursive';
    ctx.fillText('Google Snake Master', 1200, lineY - 12);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('BOARD ARBITER', 1200, lineY + 28);

    // Export to PNG and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeFileName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `Google_Snake_Certificate_${safeFileName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
      setIsDownloading(false);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] text-white rounded-2xl p-5 sm:p-7 shadow-2xl border border-slate-700 flex flex-col items-center">
        {/* Certificate Preview Card */}
        <div
          ref={canvasRef as unknown as React.RefObject<HTMLDivElement>}
          className="relative w-full aspect-[16/11] bg-gradient-to-br from-[#fdfbf5] via-[#fbf8eb] to-[#f7f2dd] rounded-xl p-5 sm:p-8 shadow-inner border-8 border-[#1e3a8a] text-slate-900 flex flex-col justify-between items-center text-center overflow-hidden"
        >
          {/* Inner Gold Inset Frame */}
          <div className="absolute inset-2 border-2 border-[#d97706] pointer-events-none rounded-sm"></div>

          {/* Top Emblem */}
          <div className="flex flex-col items-center mt-1 sm:mt-2">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-500 border-2 border-amber-600 flex items-center justify-center shadow-md text-white mb-1.5 sm:mb-2">
              <Award className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="text-sm sm:text-xl font-extrabold tracking-wider text-[#1e3a8a] font-serif uppercase">
              Certificate of Achievement
            </h4>
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 tracking-widest uppercase">
              Google Snake Grandmaster
            </span>
          </div>

          {/* Recipient Section */}
          <div className="my-auto w-full px-4">
            <p className="text-[11px] sm:text-xs italic text-slate-500 font-serif mb-1">
              This is proudly presented to
            </p>
            <div className="text-xl sm:text-3xl font-black font-serif text-slate-900 border-b-2 border-amber-500/60 pb-1 max-w-md mx-auto truncate">
              {recipientName || 'Your Name'}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 font-serif mt-2 max-w-md mx-auto">
              For mastering the Google Snake board with an undisputed Perfect Score of{' '}
              <strong className="text-amber-700 font-sans">{score}</strong> across all{' '}
              <strong className="text-amber-700 font-sans">{totalCells}</strong> cells.
            </p>
          </div>

          {/* Bottom Stamp & Date */}
          <div className="w-full flex items-center justify-between text-[9px] sm:text-[11px] text-slate-500 border-t border-slate-300/60 pt-2 px-2 sm:px-4">
            <div className="text-left">
              <span className="font-semibold text-slate-800 block">{formattedDate}</span>
              <span>Date Verified</span>
            </div>
            <div className="text-amber-800 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
              ★ Official 100% Clear ★
            </div>
            <div className="text-right">
              <span className="font-serif italic font-bold text-slate-800 block">Google Snake Arbiter</span>
              <span>Authorized Award</span>
            </div>
          </div>
        </div>

        {/* Name Input Field */}
        <div className="w-full mt-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
            Enter Your Name for the Certificate:
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Type your name here..."
            maxLength={40}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-500"
          />
        </div>

        {/* Action Buttons: Download & Play Again */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 w-full sm:flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-950" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{isDownloading ? 'Generating PNG...' : 'Download Certificate (PNG)'}</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
