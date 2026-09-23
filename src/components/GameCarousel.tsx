import React from 'react';
import { GameItem } from '../types';
import { Dices, Trophy, Compass, Users, Play, Star, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface GameCarouselProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const GameCarousel: React.FC<GameCarouselProps> = ({
  games,
  onSelectGame,
  isLoading,
  error,
  onRetry,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dices':
        return <Dices className="w-6 h-6" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6" />;
      case 'Compass':
        return <Compass className="w-6 h-6" />;
      default:
        return <Dices className="w-6 h-6" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sora font-bold text-[#0E1A2B] text-sm">Featured Games</h3>
        <span className="text-xs text-[#2E9BFF] font-semibold cursor-pointer">View All</span>
      </div>

      {isLoading ? (
        <div className="flex space-x-3.5 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="min-w-[220px] max-w-[220px] bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-4 flex flex-col justify-between h-[150px] animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                <div className="w-12 h-5 bg-gray-200 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center text-red-500 space-x-1.5">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex space-x-3.5 overflow-x-auto pb-2 scrollbar-none">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => onSelectGame(game)}
              className="min-w-[220px] max-w-[220px] bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all duration-200 cursor-pointer active:scale-98 relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: game.accentColor }}
                  >
                    {getIcon(game.iconName)}
                  </div>
                  <div className="flex items-center space-x-1 bg-white/80 px-2 py-0.5 rounded-full text-[11px] font-semibold text-[#0E1A2B]">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{game.rating}</span>
                  </div>
                </div>

                <h4 className="font-sora font-bold text-[#0E1A2B] text-sm mb-1">{game.name}</h4>
                <p className="text-xs text-[#66758A] line-clamp-2 leading-relaxed mb-3">
                  {game.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[rgba(11,79,158,0.08)] flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[11px] text-[#66758A]">
                  <Users className="w-3.5 h-3.5" />
                  <span>{game.minPlayers}–{game.maxPlayers} players</span>
                </div>
                <button
                  className="w-8 h-8 rounded-lg bg-white group-hover:bg-[#2E9BFF] group-hover:text-white text-[#0B4F9E] flex items-center justify-center shadow-xs transition-colors"
                  style={{ color: game.accentColor }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

