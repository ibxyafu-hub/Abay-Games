import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface UserIdentityCardProps {
  user: UserProfile;
}

export const UserIdentityCard: React.FC<UserIdentityCardProps> = ({ user }) => {
  const [displayCoins, setDisplayCoins] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800; // 800ms
    const target = user.coins;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayCoins(Math.floor(easedProgress * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [user.coins]);

  return (
    <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#2E9BFF]/30 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <p className="text-xs text-[#66758A] font-medium">Welcome back,</p>
          <h2 className="font-sora font-bold text-[#0E1A2B] text-base leading-snug">
            {user.displayName}
          </h2>
          <div className="flex items-center space-x-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E9BFF]" />
            <span className="text-xs font-semibold text-[#0B4F9E]">{user.rank}</span>
            <span className="text-xs text-[#66758A]">• Lvl {user.level}</span>
          </div>
        </div>
      </div>

      <div className="bg-white px-3.5 py-2 rounded-xl border border-[rgba(11,79,158,0.12)] shadow-sm flex items-center space-x-2">
        <span className="text-base">🪙</span>
        <div>
          <p className="text-[10px] text-[#66758A] uppercase font-semibold leading-none">Coins</p>
          <p className="font-sora font-bold text-[#0E1A2B] text-sm leading-tight mt-0.5">
            {displayCoins.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
