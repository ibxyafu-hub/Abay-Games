import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../types';
import { ArrowLeft, RefreshCw, X, Shield, Search, Check, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface FantasyTransfersModalProps {
  squad: any;
  onClose: () => void;
  onTransferSuccess: () => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const FantasyTransfersModal: React.FC<FantasyTransfersModalProps> = ({
  squad,
  onClose,
  onTransferSuccess,
  showToast,
}) => {
  const [step, setStep] = useState<'select_out' | 'select_in'>('select_out');
  const [playerOut, setPlayerOut] = useState<any | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const squadPlayers = squad?.fantasy_squad_players?.map((sp: any) => ({
    ...sp.fantasy_players,
    is_captain: sp.is_captain,
    is_vice_captain: sp.is_vice_captain,
  })) || [];

  const currentSpent = squadPlayers.reduce((acc: number, p: any) => acc + Number(p.price || 0), 0);
  const remainingBudget = Number((100.0 - currentSpent).toFixed(1));

  useEffect(() => {
    if (step === 'select_in' && playerOut) {
      setIsLoadingPlayers(true);
      fetch(`/api/fantasy/players`)
        .then(async (res) => {
          const data = await res.json();
          if (data.success && data.players) {
            // Filter out players already in squad and match position
            const squadIds = new Set(squadPlayers.map((p: any) => p.id));
            setAvailablePlayers(
              data.players.filter((p: any) => !squadIds.has(p.id) && p.position === playerOut.position)
            );
          } else {
            setAvailablePlayers([]);
          }
        })
        .catch(() => showToast('Failed to load available replacement players', 'warning'))
        .finally(() => setIsLoadingPlayers(false));
    }
  }, [step, playerOut]);

  const handleExecuteTransfer = async (playerIn: any) => {
    if (!playerOut || !playerIn) return;

    // Check budget impact
    const priceDiff = Number(playerIn.price) - Number(playerOut.price);
    if (priceDiff > remainingBudget) {
      showToast('Not enough budget for this transfer', 'warning');
      return;
    }

    setIsExecuting(true);
    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/fantasy/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerOutId: playerOut.id,
          playerInId: playerIn.id,
          initData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transfer failed');
      }

      showToast('Transfer completed successfully!', 'success');
      onTransferSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Transfer failed', 'warning');
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredReplacements = availablePlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.club?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#E3EEFA] flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#0B4F9E] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ArrowRightLeft className="w-5 h-5 text-[#2E9BFF]" />
            <h3 className="font-sora font-bold text-base">
              {step === 'select_out' ? 'Select Player to Transfer Out' : `Replace ${playerOut?.name} (${playerOut?.position})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Budget Bar */}
        <div className="bg-[#F0F6FC] px-5 py-3 border-b border-[#E3EEFA] flex items-center justify-between text-xs">
          <span className="text-[#66758A]">Remaining Budget:</span>
          <span className="font-sora font-extrabold text-[#0B4F9E] text-sm">£{remainingBudget}M</span>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {step === 'select_out' ? (
            <div className="space-y-2">
              <p className="text-xs text-[#66758A] mb-3">Choose a player from your permanent squad to sell/transfer out:</p>
              {squadPlayers.map((player: any) => (
                <div
                  key={player.id}
                  onClick={() => {
                    setPlayerOut(player);
                    setStep('select_in');
                  }}
                  className="bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[#E3EEFA] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-xl bg-[#0B4F9E]/10 text-[#0B4F9E] font-bold text-xs flex items-center justify-center">
                      {player.position}
                    </span>
                    <div>
                      <div className="font-sora font-bold text-sm text-[#0E1A2B]">{player.name}</div>
                      <div className="text-[11px] text-[#66758A]">{player.club || 'Club'} • £{player.price}M</div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#2E9BFF] text-white font-sora font-bold text-xs rounded-xl shadow-xs">
                    Transfer Out
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('select_out')}
                  className="text-xs font-sora font-bold text-[#0B4F9E] flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose different player</span>
                </button>
                <span className="text-xs text-[#66758A]">Position: {playerOut?.position}</span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66758A]" />
                <input
                  type="text"
                  placeholder={`Search ${playerOut?.position} replacements...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F0F6FC] border border-[#E3EEFA] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0E1A2B] focus:outline-none focus:border-[#2E9BFF]"
                />
              </div>

              {isLoadingPlayers ? (
                <div className="py-12 text-center text-xs text-[#66758A]">Loading replacements...</div>
              ) : filteredReplacements.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#66758A]">No eligible {playerOut?.position} players found.</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filteredReplacements.map((player) => {
                    const canAfford = remainingBudget >= Number(player.price);
                    return (
                      <div
                        key={player.id}
                        className="bg-[#F0F6FC] border border-[#E3EEFA] rounded-2xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-sora font-bold text-[#0E1A2B]">{player.name}</div>
                          <div className="text-[10px] text-[#66758A]">{player.club} • £{player.price}M • {player.points || 0} pts</div>
                        </div>
                        <button
                          onClick={() => handleExecuteTransfer(player)}
                          disabled={!canAfford || isExecuting}
                          className={`px-3 py-1.5 font-sora font-bold text-xs rounded-xl shadow-xs cursor-pointer ${
                            canAfford ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isExecuting ? 'Transferring...' : canAfford ? 'Sign Player' : 'Too Expensive'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
