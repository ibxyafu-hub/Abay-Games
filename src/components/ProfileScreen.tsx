import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Award, Flame, ShieldCheck, Zap, TrendingUp, BarChart3 } from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const winRate = Math.round((user.wins / user.gamesPlayed) * 100);
  const xpPercentage = Math.min(100, Math.round((user.xp / 6000) * 100));

  const gameStats = [
    { name: 'Ludo', played: 80, wins: 58, winRate: 72, color: '#2E9BFF' },
    { name: 'Fantasy', played: 42, wins: 28, winRate: 66, color: '#0B4F9E' },
    { name: 'Unchase', played: 20, wins: 10, winRate: 50, color: '#17B8D6' },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="font-sora font-extrabold text-[#0E1A2B] text-xl tracking-tight">Player Profile</h2>
        <p className="text-xs text-[#66758A]">Telegram Gaming ID & Statistics.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#2E9BFF] to-[#0B4F9E] opacity-15" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full p-1 bg-white shadow-md mb-3">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <h3 className="font-sora font-bold text-[#0E1A2B] text-lg">{user.displayName}</h3>
          <p className="text-xs text-[#66758A]">@{user.username} • ID: {user.telegramId}</p>

          <div className="inline-flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full text-xs font-semibold text-[#0B4F9E] mt-3 shadow-xs border border-[rgba(11,79,158,0.1)]">
            <ShieldCheck className="w-4 h-4 text-[#2E9BFF]" />
            <span>{user.rank}</span>
          </div>

          {/* XP Progress */}
          <div className="mt-4 pt-4 border-t border-[rgba(11,79,158,0.08)] text-left">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#0E1A2B]">Level {user.level} Progress</span>
              <span className="text-[#2E9BFF]">{user.xp} / 6,000 XP</span>
            </div>
            <div className="w-full bg-white h-2.5 rounded-full overflow-hidden p-0.5 border border-[rgba(11,79,158,0.1)]">
              <div
                className="bg-gradient-to-r from-[#2E9BFF] to-[#0B4F9E] h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-[#66758A] font-semibold">Played</p>
          <p className="font-sora font-extrabold text-[#0E1A2B] text-lg mt-0.5">{user.gamesPlayed}</p>
        </div>
        <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-[#66758A] font-semibold">Wins</p>
          <p className="font-sora font-extrabold text-emerald-600 text-lg mt-0.5">{user.wins}</p>
        </div>
        <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-[#66758A] font-semibold">Win Rate</p>
          <p className="font-sora font-extrabold text-[#2E9BFF] text-lg mt-0.5">{winRate}%</p>
        </div>
      </div>

      {/* Performance by Game */}
      <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#2E9BFF]" />
          <h4 className="font-sora font-bold text-[#0E1A2B] text-sm">Game Performance</h4>
        </div>

        <div className="space-y-3">
          {gameStats.map((stat) => (
            <div key={stat.name} className="bg-white p-3 rounded-xl border border-[rgba(11,79,158,0.08)]">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#0E1A2B]">{stat.name}</span>
                <span className="text-[#66758A]">{stat.wins} Wins / {stat.played} Played ({stat.winRate}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${stat.winRate}%`, backgroundColor: stat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
