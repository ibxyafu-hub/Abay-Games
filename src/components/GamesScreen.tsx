import React, { useState } from 'react';
import { GameItem } from '../types';
import { Dices, Trophy, Compass, Users, Play, Star, Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface GamesScreenProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const GamesScreen: React.FC<GamesScreenProps> = ({
  games,
  onSelectGame,
  isLoading,
  error,
  onRetry,
}) => {
  const [filter, setFilter] = useState<'all' | 'board' | 'sports' | 'strategy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter((g) => {
    const matchesFilter = filter === 'all' || g.category === filter;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="font-sora font-extrabold text-[#0E1A2B] text-xl tracking-tight">Game Lobby</h2>
        <p className="text-xs text-[#66758A]">Choose your favorite title and enter the arena.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66758A]" />
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0E1A2B] placeholder-[#66758A] focus:outline-none focus:border-[#2E9BFF]"
        />
      </div>

      {/* Categories Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'board', 'sports', 'strategy'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === cat
                ? 'bg-[#2E9BFF] text-white shadow-sm shadow-[#2E9BFF]/30'
                : 'bg-[#F0F6FC] text-[#66758A] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-4 flex items-center justify-between h-[80px] animate-pulse"
            >
              <div className="flex items-center space-x-3.5 w-full">
                <div className="w-13 h-13 bg-gray-200 rounded-2xl shrink-0" />
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <div className="flex items-center justify-center text-red-500 space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-8 text-center text-[#66758A] text-xs">
          No games found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onSelectGame(game)}
              className="bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{ backgroundColor: game.accentColor }}
                >
                  {getIcon(game.iconName)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-sora font-bold text-[#0E1A2B] text-sm">{game.name}</h3>
                    <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md text-[#0B4F9E] border border-[rgba(11,79,158,0.1)]">
                      {game.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#66758A] line-clamp-1 mt-0.5">{game.description}</p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-[#66758A]">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{game.minPlayers}–{game.maxPlayers} players</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-amber-600 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{game.rating}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-10 h-10 rounded-xl bg-white group-hover:bg-[#2E9BFF] group-hover:text-white text-[#0B4F9E] flex items-center justify-center shadow-xs transition-colors shrink-0"
                style={{ color: game.accentColor }}
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

