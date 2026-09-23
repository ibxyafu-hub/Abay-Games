import React, { useState, useEffect } from 'react';
import { FantasyPlayer, ToastMessage } from '../types';
import { ArrowLeft, Search, Shield, User, Star, Crown, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface FantasyBuilderScreenProps {
  leagueId: string;
  leagueName: string;
  tournamentId?: string;
  onBack: () => void;
  onSquadConfirmed: (squad: FantasyPlayer[], captainId: string, viceCaptainId: string) => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const FantasyBuilderScreen: React.FC<FantasyBuilderScreenProps> = ({
  leagueId,
  leagueName,
  tournamentId,
  onBack,
  onSquadConfirmed,
  showToast,
}) => {
  const [players, setPlayers] = useState<FantasyPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Squad state
  const [selectedSquad, setSelectedSquad] = useState<FantasyPlayer[]>([]);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Captain & Vice Captain state
  const [captainId, setCaptainId] = useState<string>('');
  const [viceCaptainId, setViceCaptainId] = useState<string>('');

  // Budget
  const startingBudget = 100.0;
  const currentSpent = selectedSquad.reduce((acc, p) => acc + Number(p.price || 0), 0);
  const remainingBudget = Number((startingBudget - currentSpent).toFixed(1));

  // Position counts
  const gkCount = selectedSquad.filter((p) => p.position === 'GK').length;
  const defCount = selectedSquad.filter((p) => p.position === 'DEF').length;
  const midCount = selectedSquad.filter((p) => p.position === 'MID').length;
  const fwdCount = selectedSquad.filter((p) => p.position === 'FWD').length;

  const totalPlayers = selectedSquad.length;

  useEffect(() => {
    setIsLoading(true);
    setErrorMsg(null);
    fetch(`/api/fantasy/players?league=${encodeURIComponent(leagueId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load players');
        const data = await res.json();
        if (data.success && data.players) {
          setPlayers(data.players);
        } else {
          setPlayers([]);
        }
      })
      .catch((err) => {
        setErrorMsg('Unable to load players. Please try again.');
        showToast('Unable to load players. Please try again.', 'warning');
      })
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  const handleAddPlayer = (player: FantasyPlayer) => {
    // Check if already selected
    if (selectedSquad.some((p) => p.id === player.id)) {
      // Remove player
      setSelectedSquad((prev) => prev.filter((p) => p.id !== player.id));
      if (captainId === player.id) setCaptainId('');
      if (viceCaptainId === player.id) setViceCaptainId('');
      return;
    }

    if (totalPlayers >= 11) {
      showToast('Squad is already complete (11 players)', 'warning');
      return;
    }

    // Check position limits
    if (player.position === 'GK' && gkCount >= 1) {
      showToast('Position limit reached (Max 1 GK)', 'warning');
      return;
    }
    if (player.position === 'DEF' && defCount >= 5) {
      showToast('Position limit reached (Max 5 DEF)', 'warning');
      return;
    }
    if (player.position === 'MID' && midCount >= 5) {
      showToast('Position limit reached (Max 5 MID)', 'warning');
      return;
    }
    if (player.position === 'FWD' && fwdCount >= 3) {
      showToast('Position limit reached (Max 3 FWD)', 'warning');
      return;
    }

    // Check budget
    if (remainingBudget < Number(player.price)) {
      showToast('Not enough budget', 'warning');
      return;
    }

    setSelectedSquad((prev) => [...prev, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedSquad((prev) => prev.filter((p) => p.id !== playerId));
    if (captainId === playerId) setCaptainId('');
    if (viceCaptainId === playerId) setViceCaptainId('');
  };

  const isSquadComplete = 
    gkCount === 1 && 
    defCount >= 3 && defCount <= 5 && 
    midCount >= 3 && midCount <= 5 && 
    fwdCount >= 1 && fwdCount <= 3 && 
    totalPlayers === 11;

  const handleProceedToConfirmation = () => {
    if (!isSquadComplete) {
      showToast('Complete your 11-player squad formation first (1 GK, 3-5 DEF, 3-5 MID, 1-3 FWD)', 'warning');
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    if (!captainId || !viceCaptainId || captainId === viceCaptainId) {
      showToast('Please select exactly 1 Captain and 1 Vice Captain (must be different).', 'warning');
      return;
    }

    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/fantasy/squads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          leagueName,
          players: selectedSquad,
          captainId,
          viceCaptainId,
          initData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save squad');
      }

      showToast('Fantasy squad confirmed and saved successfully!', 'success');
      onSquadConfirmed(selectedSquad, captainId, viceCaptainId);
    } catch (err: any) {
      showToast(err.message || 'Error saving squad to server', 'warning');
    }
  };

  const filteredPlayers = players.filter((p) => {
    const matchesTab = activeTab === 'ALL' || p.position === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F0F6FC] text-[#0E1A2B] pb-28">
      {/* Top Header */}
      <div className="bg-[#0B4F9E] text-white sticky top-0 z-20 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              if (isConfirming) setIsConfirming(false);
              else onBack();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-sora font-bold text-base text-center tracking-tight">
            {isConfirming ? 'Confirm Squad & Captains' : 'Fantasy Squad Builder'}
          </h1>
          <div className="w-9" />
        </div>

        {/* Budget & Squad stats bar */}
        {!isConfirming && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/15 text-xs">
            <div className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
              <span className="text-white/80">Remaining Budget:</span>
              <span className="font-sora font-bold text-emerald-300 text-sm">{remainingBudget}M</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
              <span className="text-white/80">Squad Players:</span>
              <span className="font-sora font-bold text-white text-sm">{totalPlayers}/11</span>
            </div>
          </div>
        )}
      </div>

      {/* Position Counters Bar */}
      {!isConfirming && (
        <div className="bg-white px-4 py-2 border-b border-[#E3EEFA] shadow-xs flex justify-around text-center text-xs font-sora font-semibold">
          <div className={`px-2 py-1 rounded-md ${gkCount === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-[#66758A]'}`}>
            GK {gkCount}/1
          </div>
          <div className={`px-2 py-1 rounded-md ${defCount >= 3 && defCount <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-[#66758A]'}`}>
            DEF {defCount} (3-5)
          </div>
          <div className={`px-2 py-1 rounded-md ${midCount >= 3 && midCount <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-[#66758A]'}`}>
            MID {midCount} (3-5)
          </div>
          <div className={`px-2 py-1 rounded-md ${fwdCount >= 1 && fwdCount <= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-[#66758A]'}`}>
            FWD {fwdCount} (1-3)
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-xl mx-auto p-4">
        {!isConfirming ? (
          <>
            {/* Search & Filters */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#66758A]" />
                <input
                  type="text"
                  placeholder="Search player or club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#E3EEFA] text-sm focus:outline-none focus:border-[#2E9BFF] shadow-2xs"
                />
              </div>

              {/* Position Tabs */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-sora font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-[#0B4F9E] text-white shadow-md shadow-[#0B4F9E]/20'
                        : 'bg-white text-[#66758A] border border-[#E3EEFA] hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Squad Preview Tray */}
            {selectedSquad.length > 0 && (
              <div className="bg-white rounded-2xl p-3 mb-4 border border-[#E3EEFA] shadow-xs">
                <h3 className="text-xs font-sora font-bold text-[#66758A] mb-2 uppercase tracking-wide">
                  Selected Squad ({selectedSquad.length}/11)
                </h3>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {selectedSquad.map((p) => (
                    <div
                      key={p.id}
                      className="flex-shrink-0 bg-[#F0F6FC] border border-[#E3EEFA] rounded-xl p-2 w-24 text-center relative group"
                    >
                      <button
                        onClick={() => handleRemovePlayer(p.id)}
                        className="absolute -top-1.5 -right-1.5 bg-[#FF5A6E] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm hover:scale-110 transition-transform cursor-pointer"
                      >
                        ×
                      </button>
                      <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full mx-auto object-cover mb-1 border border-white shadow-xs" />
                      <div className="text-[11px] font-bold truncate text-[#0E1A2B]">{p.name.split(' ').pop()}</div>
                      <div className="text-[10px] text-[#0B4F9E] font-semibold">{p.position} • {p.price}M</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player List */}
            {isLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white h-20 rounded-2xl animate-pulse p-4 flex items-center space-x-4 border border-[#E3EEFA]" />
                ))}
              </div>
            ) : errorMsg ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#E3EEFA] my-6">
                <AlertCircle className="w-10 h-10 text-[#FF5A6E] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#0E1A2B] mb-1">{errorMsg}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-[#0B4F9E] text-white text-xs font-bold rounded-xl"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E3EEFA] my-6">
                <User className="w-10 h-10 text-[#66758A] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#0E1A2B]">No players found</p>
                <p className="text-xs text-[#66758A] mt-1">Try adjusting your search or position filter.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredPlayers.map((player) => {
                  const isSelected = selectedSquad.some((p) => p.id === player.id);
                  return (
                    <motion.div
                      key={player.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAddPlayer(player)}
                      className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#2E9BFF] bg-[#E3EEFA]/30 shadow-xs ring-2 ring-[#2E9BFF]/20'
                          : 'border-[#E3EEFA] hover:border-[#0B4F9E]/30 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#E3EEFA]"
                        />
                        <div>
                          <div className="font-sora font-bold text-sm text-[#0E1A2B]">{player.name}</div>
                          <div className="text-xs text-[#66758A] flex items-center space-x-2 mt-0.5">
                            <span>{player.club}</span>
                            <span>•</span>
                            <span className="font-bold text-[#0B4F9E]">{player.position}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center space-x-3">
                        <div>
                          <div className="font-sora font-bold text-sm text-[#0E1A2B]">{player.price}M</div>
                          <div className="text-[11px] text-[#66758A] font-medium">{player.points} pts</div>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#2E9BFF] text-white shadow-sm' : 'bg-[#F0F6FC] text-[#66758A] border border-[#E3EEFA]'
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : '+'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Confirmation & Captain Selection Screen */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E3EEFA] shadow-xs">
              <h2 className="font-sora font-bold text-base text-[#0E1A2B] mb-1">Select Captain & Vice Captain</h2>
              <p className="text-xs text-[#66758A]">Choose 1 Captain (C) and 1 Vice Captain (VC) from your 11 selected squad players.</p>
            </div>

            <div className="space-y-2">
              {selectedSquad.map((player) => {
                const isC = captainId === player.id;
                const isVC = viceCaptainId === player.id;
                return (
                  <div key={player.id} className="bg-white rounded-2xl p-3 border border-[#E3EEFA] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center space-x-3">
                      <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <div className="font-sora font-bold text-sm text-[#0E1A2B]">{player.name}</div>
                        <div className="text-xs text-[#66758A]">{player.club} • {player.position} • {player.price}M</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (isVC) setViceCaptainId('');
                          setCaptainId(isC ? '' : player.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sora font-bold transition-all cursor-pointer ${
                          isC ? 'bg-[#0B4F9E] text-white shadow-sm' : 'bg-[#F0F6FC] text-[#66758A] border border-[#E3EEFA] hover:bg-gray-100'
                        }`}
                      >
                        {isC ? 'Captain (C)' : 'Set C'}
                      </button>
                      <button
                        onClick={() => {
                          if (isC) setCaptainId('');
                          setViceCaptainId(isVC ? '' : player.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sora font-bold transition-all cursor-pointer ${
                          isVC ? 'bg-[#2E9BFF] text-white shadow-sm' : 'bg-[#F0F6FC] text-[#66758A] border border-[#E3EEFA] hover:bg-gray-100'
                        }`}
                      >
                        {isVC ? 'Vice (VC)' : 'Set VC'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3EEFA] p-4 shadow-lg z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-[#66758A]">Squad Status</div>
            <div className="font-sora font-bold text-sm text-[#0E1A2B]">
              {totalPlayers} / 11 Players ({remainingBudget}M left)
            </div>
          </div>

          {!isConfirming ? (
            <button
              onClick={handleProceedToConfirmation}
              disabled={!isSquadComplete}
              className={`px-6 py-3 rounded-2xl font-sora font-bold text-sm text-white transition-all cursor-pointer ${
                isSquadComplete
                  ? 'bg-[#0B4F9E] hover:bg-[#0a4185] shadow-lg shadow-[#0B4F9E]/25'
                  : 'bg-gray-300 cursor-not-allowed opacity-75'
              }`}
            >
              Confirm Squad
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-3 rounded-2xl font-sora font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center space-x-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Join Tournament</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
