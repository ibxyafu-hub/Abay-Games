import React, { useState, useEffect } from 'react';
import { UserProfile, ToastMessage } from '../types';
import { ArrowLeft, Trophy, Users, Shield, Play, CheckCircle2, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface FantasyTournamentLobbyScreenProps {
  tournamentId: string;
  currentUser: UserProfile;
  onBack: () => void;
  onOpenBuilder: (leagueId: string, leagueName: string) => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

interface Participant {
  user_id: string;
  joined_at: string;
  has_valid_squad: boolean;
  squad?: any;
}

interface TournamentDetails {
  id: string;
  name: string;
  league_name: string;
  league_id: string;
  owner_user_id: string;
  status: 'waiting' | 'open' | 'started' | 'completed';
  max_players: number;
  current_players: number;
  participants: Participant[];
}

export const FantasyTournamentLobbyScreen: React.FC<FantasyTournamentLobbyScreenProps> = ({
  tournamentId,
  currentUser,
  onBack,
  onOpenBuilder,
  showToast,
}) => {
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [startError, setStartError] = useState<string | null>(null);

  const fetchTournamentDetails = async () => {
    setIsLoading(true);
    setStartError(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await res.json();
      if (data.success && data.tournament) {
        setTournament(data.tournament);
      } else {
        showToast(data.error || 'Failed to load tournament', 'warning');
      }
    } catch (err) {
      showToast('Error loading tournament details', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails();
  }, [tournamentId]);

  const userId = (currentUser as any).id || currentUser.telegramId;
  const isOwner = tournament?.owner_user_id === userId;
  const currentParticipant = tournament?.participants?.find((p) => p.user_id === userId);
  const hasValidSquad = currentParticipant?.has_valid_squad || false;
  const isStarted = tournament?.status === 'started' || tournament?.status === 'completed';

  const handleStartTournament = async () => {
    if (!isOwner) return;
    setIsStarting(true);
    setStartError(null);

    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/tournaments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, initData }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start tournament');
      }

      showToast('Tournament started successfully!', 'success');
      fetchTournamentDetails();
    } catch (err: any) {
      setStartError(err.message || 'Cannot start tournament');
      showToast(err.message || 'Error starting tournament', 'warning');
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeaveTournament = async () => {
    if (isOwner) {
      showToast('Owner cannot leave tournament', 'warning');
      return;
    }
    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/tournaments/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, initData }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to leave tournament');
      }
      showToast('Left tournament', 'info');
      onBack();
    } catch (err: any) {
      showToast(err.message || 'Error leaving tournament', 'warning');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F6FC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0B4F9E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#F0F6FC] p-6 text-center">
        <h2 className="font-sora font-bold text-lg text-[#0E1A2B] mb-2">Tournament Not Found</h2>
        <button onClick={onBack} className="px-4 py-2 bg-[#0B4F9E] text-white rounded-xl text-xs font-bold">
          Back to Tournaments
        </button>
      </div>
    );
  }

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
          <div>
            <h1 className="font-sora font-bold text-base tracking-tight">{tournament.name}</h1>
            <div className="text-[10px] text-white/80">{tournament.league_name} • Max 50 Players</div>
          </div>
        </div>

        <button
          onClick={fetchTournamentDetails}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
          title="Refresh Lobby"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E3EEFA] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B4F9E]/10 text-[#0B4F9E] flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isStarted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isStarted ? 'Tournament Started' : 'Lobby Open (Waiting)'}
                </span>
              </div>
              <div className="font-sora font-bold text-sm text-[#0E1A2B] mt-1">
                Participants: {tournament.current_players} / 50
              </div>
            </div>
          </div>

          {!isStarted && !isOwner && (
            <button
              onClick={handleLeaveTournament}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          )}
        </div>

        {/* Squad Status & Action */}
        <div
          className={`rounded-2xl p-4 border shadow-xs flex items-center justify-between ${
            hasValidSquad ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {hasValidSquad ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <div className="font-sora font-bold text-sm text-[#0E1A2B]">
                {hasValidSquad ? 'Your Fantasy Squad is Ready (11 Players)' : 'Squad Required for Tournament'}
              </div>
              <div className="text-xs text-[#66758A] mt-0.5">
                {hasValidSquad
                  ? `Valid 100M squad built for ${tournament.league_name}.`
                  : `You must build a valid 11-player squad for ${tournament.league_name} before start.`}
              </div>
            </div>
          </div>

          {!isStarted && (
            <button
              onClick={() => onOpenBuilder(tournament.league_id, tournament.league_name)}
              className={`px-4 py-2.5 rounded-xl font-sora font-bold text-xs text-white shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                hasValidSquad ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#0B4F9E] hover:bg-[#0a4185]'
              }`}
            >
              {hasValidSquad ? 'Edit Squad' : 'Build Squad'}
            </button>
          )}
        </div>

        {/* Error message if start failed */}
        {startError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cannot Start Tournament:</span> {startError}
            </div>
          </div>
        )}

        {/* Participants List */}
        <div className="bg-white rounded-2xl p-4 border border-[#E3EEFA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-sora font-bold text-sm text-[#0E1A2B]">Joined Participants ({tournament.participants.length}/50)</h3>
            <span className="text-xs text-[#66758A]">Squad status verified server-side</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {tournament.participants.map((p, idx) => {
              const isCurrentUser = p.user_id === userId;
              const isParticipantOwner = p.user_id === tournament.owner_user_id;

              return (
                <div
                  key={p.user_id || idx}
                  className="bg-[#F0F6FC] rounded-xl p-3 border border-[#E3EEFA] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0B4F9E]/15 text-[#0B4F9E] font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-sora font-bold text-[#0E1A2B] flex items-center space-x-1.5">
                        <span>User: {String(p.user_id).slice(0, 10)}...</span>
                        {isCurrentUser && <span className="bg-[#2E9BFF]/20 text-[#0B4F9E] px-1.5 py-0.5 rounded text-[10px] font-bold">You</span>}
                        {isParticipantOwner && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Owner</span>}
                      </div>
                      <div className="text-[10px] text-[#66758A]">Joined: {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  <div>
                    {p.has_valid_squad ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold text-[10px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Squad Ready</span>
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg font-bold text-[10px] flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Squad Missing</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Owner Start Button */}
        {isOwner && !isStarted && (
          <div className="pt-2">
            <button
              onClick={handleStartTournament}
              disabled={isStarting}
              className="w-full py-4 bg-[#2E9BFF] hover:bg-[#1d8be8] text-white rounded-2xl font-sora font-bold text-sm shadow-lg shadow-[#2E9BFF]/30 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isStarting ? 'Verifying Squads & Starting...' : `Start Tournament (${tournament.participants.length} Players Joined)`}</span>
            </button>
            <p className="text-[10px] text-center text-[#66758A] mt-2">
              Server will verify all {tournament.participants.length} participants have built a valid 100M squad before starting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
