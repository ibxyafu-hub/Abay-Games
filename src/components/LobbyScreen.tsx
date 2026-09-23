import React, { useState, useEffect } from 'react';
import { GameItem, LobbyPlayer, ToastMessage, FantasyLeague } from '../types';
import { getFantasyLeagues } from '../services/gameService';
import { FantasyBuilderScreen } from './FantasyBuilderScreen';
import { ArrowLeft, UserPlus, Trophy, Sparkles, Check, Play, ShieldAlert, Crown, Users } from 'lucide-react';
import { motion } from 'motion/react';


interface LobbyScreenProps {
  game: GameItem;
  currentUser: { displayName: string; avatar: string; username: string };
  onBack: () => void;
  onStartGame: (league?: string) => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  game,
  currentUser,
  onBack,
  onStartGame,
  showToast,
}) => {
  const gameId = game.id.toLowerCase();
  const isLudo = gameId === 'ludo' || game.name.toLowerCase() === 'ludo';
  const isChess = gameId === 'chess' || game.name.toLowerCase() === 'chess';
  const isFantasy = gameId === 'fantasy' || game.name.toLowerCase() === 'fantasy';

  // Ludo player count selection (2, 3, or 4)
  const [ludoCount, setLudoCount] = useState<number>(4);

  // Fantasy leagues
  const [leagues, setLeagues] = useState<FantasyLeague[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('English Premier League');
  const [isLoadingLeagues, setIsLoadingLeagues] = useState<boolean>(false);

  useEffect(() => {
    if (isFantasy) {
      setIsLoadingLeagues(true);
      getFantasyLeagues()
        .then((data) => {
          setLeagues(data);
          if (data.length > 0) {
            setSelectedLeague(data[0].name);
          }
        })
        .catch(() => {
          const fallback = [
            { id: 'epl', name: 'English Premier League', slug: 'premier-league' },
            { id: 'laliga', name: 'La Liga', slug: 'la-liga' },
            { id: 'seriea', name: 'Serie A', slug: 'serie-a' },
          ];
          setLeagues(fallback);
          setSelectedLeague('English Premier League');
        })
        .finally(() => setIsLoadingLeagues(false));
    }
  }, [isFantasy]);

  // Players state
  const [players, setPlayers] = useState<LobbyPlayer[]>([
    {
      id: 'host',
      name: currentUser.displayName,
      avatar: currentUser.avatar,
      isReady: true,
      isHost: true,
    },
    {
      id: 'p2',
      name: 'Dawit M.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isReady: true,
    },
  ]);

  // Ensure enough initial players or slots for fantasy / ludo
  useEffect(() => {
    if (isFantasy) {
      setPlayers((prev) => {
        if (prev.some(p => p.id === 'p3')) return prev;
        return [
          ...prev,
          { id: 'p3', name: 'Sara K.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', isReady: true },
          { id: 'p4', name: 'Michael B.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', isReady: true },
          { id: 'p5', name: 'Bethlehem T.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', isReady: true },
        ];
      });
    }
  }, [isFantasy]);

  // Determine active slot count
  const maxSlots = isChess ? 2 : isLudo ? ludoCount : 50;
  const activeJoinedPlayers = players.filter((p) => p.name !== 'Waiting for player...');
  const joinedCount = activeJoinedPlayers.length;

  // Validation rules and real server-side match/tournament creation
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [showFantasyBuilder, setShowFantasyBuilder] = useState(false);
  const [savedSquad, setSavedSquad] = useState<any[] | null>(null);


  // Automatically create tournament record on mount for Fantasy so owner can start it
  useEffect(() => {
    if (isFantasy && !activeTournamentId) {
      const initData = (window as any).Telegram?.WebApp?.initData;
      fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueName: selectedLeague, initData }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.tournament) {
              setActiveTournamentId(data.tournament.id);
            }
          }
        })
        .catch((err) => console.error('Error creating tournament on server:', err));
    }
  }, [isFantasy, selectedLeague]);

  const validateAndStart = async () => {
    if (isLudo) {
      if (![2, 3, 4].includes(ludoCount)) {
        showToast('Ludo requires 2, 3, or 4 players.', 'warning');
        return;
      }
      if (joinedCount < 2) {
        showToast('At least 2 players are required to start Ludo.', 'warning');
        return;
      }
    } else if (isChess) {
      if (joinedCount !== 2) {
        showToast('Chess strictly requires exactly 2 players.', 'warning');
        return;
      }
    } else if (isFantasy) {
      if (!selectedLeague) {
        showToast('Please select an active Fantasy league.', 'warning');
        return;
      }
      if (joinedCount > 50) {
        showToast('Tournament capacity cannot exceed 50 players.', 'warning');
        return;
      }
      const isOwner = players.some((p) => p.isHost && p.name === currentUser.displayName);
      if (!isOwner) {
        showToast('Only the tournament owner can start the tournament.', 'warning');
        return;
      }
    }

    setIsCreatingMatch(true);
    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      if (isLudo || isChess) {
        const res = await fetch('/api/matches/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: isLudo ? 'ludo' : 'chess',
            targetPlayers: isLudo ? ludoCount : 2,
            initData,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create match on server');
        }
        showToast(`${game.name} match created successfully!`, 'success');
      } else if (isFantasy && activeTournamentId) {
        const res = await fetch('/api/tournaments/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournamentId: activeTournamentId,
            initData,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to start tournament on server');
        }
        showToast('Fantasy tournament started successfully!', 'success');
      }

      onStartGame(isFantasy ? selectedLeague : undefined);
    } catch (err: any) {
      showToast(err.message || 'Error communicating with server', 'warning');
    } finally {
      setIsCreatingMatch(false);
    }
  };

  const handleInvite = () => {
    showToast('Telegram invite link copied! Ready to share with friends.', 'success');
  };

  const handleAddBotOrInviteSlot = (index: number) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[index] && updated[index].name === 'Waiting for player...') {
        updated[index] = {
          id: `bot-${Date.now()}`,
          name: 'Invited Friend',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          isReady: true,
        };
        showToast('Player joined the lobby!', 'success');
      }
      return updated;
    });
  };

  if (isFantasy && showFantasyBuilder) {
    const leagueSlug = selectedLeague.toLowerCase().replace(/\s+/g, '-');
    return (
      <FantasyBuilderScreen
        leagueId={leagueSlug}
        leagueName={selectedLeague}
        tournamentId={activeTournamentId || undefined}
        onBack={() => setShowFantasyBuilder(false)}
        onSquadConfirmed={(squad) => {
          setSavedSquad(squad);
          setShowFantasyBuilder(false);
          showToast('Fantasy squad built and saved successfully!', 'success');
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.9, 0.32, 1] }}
      className="space-y-5 pb-24"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] flex items-center justify-center text-[#0E1A2B] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="font-sora font-bold text-[#0E1A2B] text-base">{game.name} Room</h2>
          <p className="text-[11px] text-[#66758A]">{game.tagline}</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Ludo Player Count Selector (2, 3, or 4 players) */}
      {isLudo && (
        <div className="bg-[#F0F6FC] p-3 rounded-2xl border border-[rgba(11,79,158,0.12)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0E1A2B]">Select Match Size</span>
            <span className="text-[11px] text-[#2E9BFF] font-semibold">{ludoCount} Players</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((count) => {
              const isSelected = ludoCount === count;
              return (
                <button
                  key={count}
                  onClick={() => setLudoCount(count)}
                  className={`py-2 rounded-xl text-xs font-sora font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2E9BFF] text-white border-[#2E9BFF] shadow-xs'
                      : 'bg-white text-[#0E1A2B] border-[rgba(11,79,158,0.12)] hover:bg-[#E3EEFA]'
                  }`}
                >
                  {count} Players
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chess Rule Indicator */}
      {isChess && (
        <div className="bg-[#F0F6FC] p-3 rounded-2xl border border-[rgba(11,79,158,0.12)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#17B8D6]/15 flex items-center justify-center text-[#17B8D6]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-sora font-bold text-[#0E1A2B]">Grandmaster Chess Match</p>
              <p className="text-[10px] text-[#66758A]">Strictly 2-player head-to-head duel</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#17B8D6] bg-[#17B8D6]/10 px-2.5 py-1 rounded-lg">2 Players</span>
        </div>
      )}

      {/* Fantasy League Segmented Control */}
      {isFantasy && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0E1A2B]">Select Fantasy League</span>
            <span className="text-[11px] text-[#0B4F9E] font-semibold">Active Leagues</span>
          </div>
          <div className="bg-[#F0F6FC] p-1 rounded-xl border border-[rgba(11,79,158,0.12)] relative flex">
            {isLoadingLeagues ? (
              <div className="w-full py-3 text-center text-xs text-[#66758A]">Loading active leagues...</div>
            ) : (
              leagues.map((league) => {
                const isSelected = selectedLeague === league.name;
                return (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.name)}
                    className={`flex-1 relative z-10 py-2 text-[11px] font-semibold transition-colors cursor-pointer truncate px-1 ${
                      isSelected ? 'text-[#0E1A2B]' : 'text-[#66758A] hover:text-[#0E1A2B]'
                    }`}
                  >
                    {league.name}
                  </button>
                );
              })
            )}
            {!isLoadingLeagues && leagues.length > 0 && (
              <motion.div
                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-xs border border-[rgba(11,79,158,0.1)]"
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                style={{
                  width: `${100 / leagues.length}%`,
                  left: `${(Math.max(0, leagues.findIndex((l) => l.name === selectedLeague)) * 100) / leagues.length}%`,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Game Info Summary Card */}
      <div
        className="rounded-2xl p-4 text-white flex items-center justify-between shadow-md"
        style={{ backgroundColor: game.accentColor }}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
            {isFantasy ? 'Tournament Lobby • Max 50' : `${game.name} Arena`} {isFantasy && `• ${selectedLeague}`}
          </span>
          <h3 className="font-sora font-bold text-lg mt-1">{game.name}</h3>
          <p className="text-xs text-white/80 mt-0.5">
            {isFantasy
              ? `Creator can start with any number of joined players (Current: ${joinedCount}/50)`
              : isChess
              ? 'Strictly 2 Players'
              : `${ludoCount} Player Match`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-sora font-extrabold text-xl">
          {game.name.charAt(0)}
        </div>
      </div>

      {/* Tournament Info for Fantasy */}
      {isFantasy && (
        <div className="bg-[#F0F6FC] p-3.5 rounded-2xl border border-[rgba(11,79,158,0.12)] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B4F9E]/15 flex items-center justify-center text-[#0B4F9E]">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#66758A]">Tournament Owner</p>
              <p className="font-sora font-bold text-xs text-[#0E1A2B]">{currentUser.displayName} (You)</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#0B4F9E] bg-[#0B4F9E]/10 px-2.5 py-1 rounded-lg">
              {joinedCount} / 50 Joined
            </span>
          </div>
        </div>
      )}

      {/* Player Slots Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-sora font-bold text-[#0E1A2B] text-sm">
            {isFantasy ? 'Joined Tournament Players' : 'Players'} ({joinedCount}/{isFantasy ? 50 : maxSlots})
          </h4>
          <span className="text-xs text-[#2E9BFF] font-semibold">
            {isFantasy ? 'Open Tournament' : `Telegram Room #${Math.floor(Math.random() * 900 + 100)}`}
          </span>
        </div>

        <div className={`grid ${isFantasy ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2'} gap-3 max-h-56 overflow-y-auto pr-1`}>
          {(isFantasy
            ? [...players, { id: 'waiting-p6', name: 'Waiting for player...', avatar: '', isReady: false }, { id: 'waiting-p7', name: 'Waiting for player...', avatar: '', isReady: false }]
            : Array.from({ length: maxSlots }).map((_, i) => players[i] || { id: `empty-${i}`, name: 'Waiting for player...', avatar: '', isReady: false })
          ).slice(0, isFantasy ? Math.max(joinedCount + 2, 6) : maxSlots).map((player, index) => {
            const isFilled = player.name !== 'Waiting for player...';

            return (
              <motion.div
                key={`${player.id || 'slot'}-${index}`}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                onClick={() => !isFilled && addBiggerOrInviteSlot(index)}
                className={`rounded-2xl p-3 border flex flex-col items-center justify-center text-center transition-all ${
                  isFilled
                    ? 'bg-[#F0F6FC] border-[rgba(11,79,158,0.12)] shadow-xs'
                    : 'bg-white border-dashed border-[rgba(11,79,158,0.25)] hover:bg-[#F0F6FC] cursor-pointer'
                }`}
              >
                {isFilled ? (
                  <>
                    <div className="relative mb-1.5">
                      <img
                        src={player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#2E9BFF]"
                      />
                      {player.isHost && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white flex items-center justify-center text-[9px] shadow-xs">
                          ★
                        </span>
                      )}
                    </div>
                    <p className="font-sora font-bold text-[#0E1A2B] text-[11px] truncate max-w-full">
                      {player.name}
                    </p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Ready</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#F0F6FC] border border-[rgba(11,79,158,0.15)] flex items-center justify-center text-[#2E9BFF] mb-1.5">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <p className="font-medium text-[#66758A] text-[10px]">Slot open</p>
                    <span className="text-[9px] text-[#2E9BFF] font-semibold">Invite</span>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Build Fantasy Squad CTA if isFantasy */}
      {isFantasy && (
        <button
          onClick={() => setShowFantasyBuilder(true)}
          className={`w-full py-3.5 px-4 rounded-xl font-sora font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-sm ${
            savedSquad
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#0B4F9E] hover:bg-[#0a4185] text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>{savedSquad ? 'Edit / View Fantasy Squad (11 Players)' : 'Build Fantasy Squad (100M Budget)'}</span>
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md">
            {savedSquad ? 'Squad Ready ✓' : 'Required'}
          </span>
        </button>
      )}

      {/* Invite Friends Button */}
      <button
        onClick={handleInvite}
        className="w-full bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] text-[#0E1A2B] font-sora font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer shadow-xs"
      >
        <UserPlus className="w-4 h-4 text-[#2E9BFF]" />
        <span>Invite Telegram Friends to Lobby</span>
      </button>

      {/* Primary CTA / Start Action */}
      <div className="pt-2">
        <button
          onClick={validateAndStart}
          disabled={isCreatingMatch}
          className="w-full py-4 rounded-2xl font-sora font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer bg-[#2E9BFF] hover:bg-[#1d8be8] text-white shadow-lg shadow-[#2E9BFF]/30 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isCreatingMatch ? 'Processing Lobby Request...' : (isFantasy ? 'Start Tournament (Owner Action)' : 'Start Game')}</span>
        </button>
        {isFantasy && (
          <p className="text-[10px] text-center text-[#66758A] mt-2">
            Tournament creator can start immediately with {joinedCount} joined players (Max capacity: 50).
          </p>
        )}
      </div>
    </motion.div>
  );

  function addBiggerOrInviteSlot(index: number) {
    handleAddBotOrInviteSlot(index);
  }
};
