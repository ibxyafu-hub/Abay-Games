import React, { useState, useEffect } from 'react';
import { UserProfile, ToastMessage } from '../types';
import { ArrowLeft, Trophy, Plus, Users, Shield, Play, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FantasyTournamentsScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  onSelectTournament: (tournamentId: string) => void;
  onOpenBuilder: (leagueId: string, leagueName: string) => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

interface Tournament {
  id: string;
  name: string;
  league_name: string;
  league_id: string;
  owner_user_id: string;
  status: 'waiting' | 'open' | 'started' | 'completed';
  max_players: number;
  current_players?: number;
  created_at: string;
  players?: Array<{ user_id: string; joined_at: string }>;
}

export const FantasyTournamentsScreen: React.FC<FantasyTournamentsScreenProps> = ({
  currentUser,
  onBack,
  onSelectTournament,
  onOpenBuilder,
  showToast,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTournamentName, setNewTournamentName] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<{ id: string; name: string }>({
    id: 'premier-league',
    name: 'Premier League',
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const leagues = [
    { id: 'premier-league', name: 'Premier League', color: '#37003c' },
    { id: 'la-liga', name: 'La Liga', color: '#ff2882' },
    { id: 'serie-a', name: 'Serie A', color: '#024494' },
  ];

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tournaments/list');
      const data = await res.json();
      if (data.success && data.tournaments) {
        setTournaments(data.tournaments);
      } else {
        setTournaments([]);
      }
    } catch (err) {
      showToast('Failed to load tournaments', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournamentName.trim()) {
      showToast('Please enter a tournament name', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTournamentName.trim(),
          leagueName: selectedLeague.name,
          leagueId: selectedLeague.id,
          initData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create tournament');
      }

      showToast('Tournament created successfully!', 'success');
      setShowCreateModal(false);
      setNewTournamentName('');
      fetchTournaments();
      if (data.tournament?.id) {
        onSelectTournament(data.tournament.id);
      }
    } catch (err: any) {
      if (err.message === 'FANTASY_TEAM_REQUIRED' || err.message?.includes('FANTASY_TEAM_REQUIRED')) {
        showToast('Please build your Fantasy team first!', 'warning');
        onOpenBuilder(selectedLeague.id, selectedLeague.name);
      } else {
        showToast(err.message || 'Error creating tournament', 'warning');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, initData }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to join tournament');
      }

      showToast('Successfully joined tournament!', 'success');
      onSelectTournament(tournamentId);
    } catch (err: any) {
      if (err.message === 'FANTASY_TEAM_REQUIRED' || err.message?.includes('FANTASY_TEAM_REQUIRED')) {
        showToast('Please build your Fantasy team first!', 'warning');
        onOpenBuilder('premier-league', 'Premier League');
      } else {
        showToast(err.message || 'Error joining tournament', 'warning');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6FC] text-[#0E1A2B] pb-28">
      {/* Header */}
      <div className="bg-[#0B4F9E] text-white sticky top-0 z-20 px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-sora font-bold text-base tracking-tight">Fantasy Tournaments</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-[#2E9BFF] hover:bg-[#1d8be8] text-white rounded-xl font-sora font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Cup</span>
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0B4F9E] to-[#2E9BFF] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-4 bottom-[-10px] opacity-15">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
              Abay Fantasy League
            </span>
            <h2 className="font-sora font-bold text-lg mt-2">Compete in 50-Player Cups</h2>
            <p className="text-xs text-white/80 mt-1 max-w-[280px]">
              Create or join tournament lobbies, build your 100M squad, and battle for glory!
            </p>
          </div>
        </div>

        {/* Tournaments List Header */}
        <div className="flex items-center justify-between pt-2">
          <h3 className="font-sora font-bold text-sm text-[#0E1A2B]">Active Tournament Lobbies</h3>
          <span className="text-xs font-semibold text-[#66758A]">{tournaments.length} available</span>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white h-24 rounded-2xl animate-pulse p-4 border border-[#E3EEFA]" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E3EEFA] my-6">
            <Trophy className="w-12 h-12 text-[#66758A] mx-auto mb-3 opacity-40" />
            <h4 className="font-sora font-bold text-sm text-[#0E1A2B]">No Tournaments Yet</h4>
            <p className="text-xs text-[#66758A] mt-1 max-w-xs mx-auto">
              Be the first to create a Fantasy tournament cup for Premier League, La Liga, or Serie A!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2.5 bg-[#0B4F9E] text-white font-sora font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-[#0a4185]"
            >
              Create Tournament Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tourn) => {
              const currentPlayers = tourn.current_players || 0;
              const currentUserId = (currentUser as any).id || currentUser.telegramId;
              const isOwner = tourn.owner_user_id === currentUserId;
              const isJoined = tourn.players?.some((p) => p.user_id === currentUserId);
              const isStarted = tourn.status === 'started' || tourn.status === 'completed';

              return (
                <motion.div
                  key={tourn.id}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-2xl p-4 border border-[#E3EEFA] shadow-2xs hover:border-[#2E9BFF]/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F0F6FC] text-[#0B4F9E] px-2 py-0.5 rounded-md border border-[#E3EEFA]">
                          {tourn.league_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isStarted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isStarted ? 'Started' : 'Open (Waiting)'}
                        </span>
                      </div>
                      <h4 className="font-sora font-bold text-base text-[#0E1A2B] mt-1.5">{tourn.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#0B4F9E] flex items-center justify-end space-x-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{currentPlayers}/50</span>
                      </div>
                      <div className="text-[10px] text-[#66758A] mt-0.5">Max 50 Players</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0F6FC] text-xs">
                    <div className="text-[#66758A] flex items-center space-x-1.5">
                      <span>Owner: {tourn.owner_user_id ? String(tourn.owner_user_id).slice(0, 8) + '...' : 'System'}</span>
                      {isOwner && <span className="bg-[#0B4F9E]/10 text-[#0B4F9E] px-1.5 py-0.5 rounded font-bold text-[10px]">You</span>}
                    </div>

                    <div className="flex space-x-2">
                      {isJoined || isOwner ? (
                        <button
                          onClick={() => onSelectTournament(tourn.id)}
                          className="px-4 py-2 bg-[#0B4F9E] hover:bg-[#0a4185] text-white font-sora font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Open Lobby</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : isStarted ? (
                        <button
                          onClick={() => onSelectTournament(tourn.id)}
                          className="px-4 py-2 bg-gray-100 text-[#66758A] font-sora font-bold text-xs rounded-xl cursor-pointer"
                        >
                          View Started Lobby
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinTournament(tourn.id)}
                          disabled={currentPlayers >= 50}
                          className="px-4 py-2 bg-[#2E9BFF] hover:bg-[#1d8be8] text-white font-sora font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          Join Tournament
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#E3EEFA]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-bold text-lg text-[#0E1A2B]">Create Fantasy Tournament</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#F0F6FC] text-[#66758A] flex items-center justify-center font-bold hover:bg-gray-200 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                  Tournament Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Champions League Pro Cup"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F6FC] rounded-xl border border-[#E3EEFA] text-sm focus:outline-none focus:border-[#2E9BFF]"
                  maxLength={40}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                  Select Football League
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {leagues.map((l) => (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() => setSelectedLeague({ id: l.id, name: l.name })}
                      className={`p-3 rounded-xl text-xs font-sora font-bold border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                        selectedLeague.id === l.id
                          ? 'bg-[#0B4F9E] text-white border-[#0B4F9E] shadow-md'
                          : 'bg-[#F0F6FC] text-[#0E1A2B] border-[#E3EEFA] hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="truncate w-full text-center">{l.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#F0F6FC] rounded-xl p-3 text-xs text-[#66758A] space-y-1">
                <div className="font-bold text-[#0E1A2B]">Tournament Rules:</div>
                <div>• Maximum 50 participants</div>
                <div>• All participants must build a valid 100M squad for {selectedLeague.name} before start</div>
                <div>• Owner can start the lobby anytime with joined players</div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#66758A] font-sora font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-3 bg-[#0B4F9E] hover:bg-[#0a4185] text-white font-sora font-bold text-xs rounded-xl shadow-lg shadow-[#0B4F9E]/20 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Cup'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
