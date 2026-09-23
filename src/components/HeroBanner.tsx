import React from 'react';
import { Play, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onQuickPlay: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onQuickPlay }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#2E9BFF] to-[#0B4F9E] rounded-2xl p-5 text-white shadow-lg shadow-[#2E9BFF]/25">
      {/* Abstract riverside / subtle circles background */}
      <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute right-12 top-2 w-20 h-20 bg-white/5 rounded-full blur-md pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Abay Champions League Live</span>
        </div>

        <h2 className="font-sora font-extrabold text-2xl tracking-tight leading-tight mb-1.5">
          Ready to play?
        </h2>
        <p className="text-xs text-white/90 font-normal leading-relaxed max-w-[240px] mb-4">
          Challenge your friends and climb the leaderboard today.
        </p>

        <button
          onClick={onQuickPlay}
          className="bg-white hover:bg-[#F0F6FC] text-[#0B4F9E] font-sora font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-[#0B4F9E]" />
          <span>Quick Play</span>
        </button>
      </div>
    </div>
  );
};
