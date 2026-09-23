import React, { useState } from 'react';
import { UserProfile, ToastMessage } from '../types';
import { Trophy, Shield, ArrowRightLeft, Clock, Plus, Users, Crown, Star, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { FantasyTransfersModal } from './FantasyTransfersModal';
import { FantasyTransferHistoryModal } from './FantasyTransferHistoryModal';

interface FantasyHomeScreenProps {
  currentUser: UserProfile;
  squad: any;
  onOpenTournaments: () => void;
  onRefreshSquad: () => void;
  onBack: () => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const FantasyHomeScreen: React.FC<FantasyHomeScreenProps> = ({
  currentUser,
  squad,
  onOpenTournaments,
  onRefreshSquad,
  onBack,
  showToast,
}) => {
  const [showTransfers, setShowTransfers] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const squadPlayers = squad?.fantasy_squad_players?.map((sp: any) => ({
    ...sp.fantasy_players,
    is_captain: sp.is_captain,
    is_vice_captain: sp.is_vice_captain,
  })) || [];

  const currentSpent = squadPlayers.reduce((acc: number, p: any) => acc + Number(p.price || 0), 0);
  const remainingBudget = Number((100.0 - currentSpent).toFixed(1));

  const gkCount = squadPlayers.filter((p: any) => p.position === 'GK').length;
  const defCount = squadPlayers.filter((p: any) => p.position === 'DEF').length;
  const midCount = squadPlayers.filter((p: any) => p.position === 'MID').length;
  const fwdCount = squadPlayers.filter((p: any) => p.position === 'FWD').length;

  return (
    <div className="min-h-screen bg-[#F0F6FC] text-[#0E1A2B] pb-12">
      {/* Header */}
      <div className="bg-[#0B4F9E] text-white px-6 pt-6 pb-8 rounded-b-3xl shadow-xl space-y-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-sora font-bold text-white/80 hover:text-white cursor-pointer flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-sora font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Transfers</span>
            </button>
            <button
              onClick={() => setShowTransfers(true)}
              className="px-3.5 py-1.5 bg-[#2E9BFF] hover:bg-[#1a85ee] text-white rounded-xl text-xs font-sora font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Make Transfer</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs text-[#2E9BFF] font-bold uppercase tracking-wider">Permanent Squad Hub</div>
            <h1 className="font-sora font-extrabold text-2xl text-white">My Fantasy Team</h1>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div>
              <div className="text-[10px] text-white/70 uppercase">Squad Value</div>
              <div className="font-sora font-bold text-sm text-white">£{(100.0 - remainingBudget).toFixed(1)}M</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-[10px] text-white/70 uppercase">Budget Left</div>
              <div className="font-sora font-bold text-sm text-emerald-400">£{remainingBudget}M</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-[10px] text-white/70 uppercase">Formation</div>
              <div className="font-sora font-bold text-sm text-white">{defCount}-{midCount}-{fwdCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 space-y-6">
        {/* Tournament CTA Banner */}
        <div className="bg-gradient-to-r from-[#0E1A2B] to-[#0B4F9E] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#2E9BFF]">Tournament Cups</div>
            <h3 className="font-sora font-bold text-lg">Compete in 50-Player Cups</h3>
            <p className="text-xs text-white/80 max-w-sm">
              Use your permanent fantasy team to create or join competitive tournament lobbies.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onOpenTournaments}
            className="px-6 py-3 bg-[#2E9BFF] hover:bg-[#1a85ee] text-white rounded-2xl font-sora font-bold text-xs shadow-lg cursor-pointer flex items-center space-x-2 shrink-0"
          >
            <Trophy className="w-4 h-4" />
            <span>View Tournaments</span>
          </motion.button>
        </div>

        {/* Squad 11 Players Grid */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#E3EEFA] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#0B4F9E]" />
              <h3 className="font-sora font-bold text-base text-[#0E1A2B]">Starting XI & Squad ({squadPlayers.length}/11)</h3>
            </div>
            <span className="text-xs text-[#66758A]">1 GK • {defCount} DEF • {midCount} MID • {fwdCount} FWD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {squadPlayers.map((player: any) => {
              const isCap = player.id === squad?.captain_id || player.is_captain;
              const isVC = player.id === squad?.vice_captain_id || player.is_vice_captain;
              return (
                <div
                  key={player.id}
                  className="bg-[#F0F6FC] border border-[#E3EEFA] rounded-2xl p-3.5 flex items-center justify-between relative"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-xl bg-[#0B4F9E]/10 text-[#0B4F9E] font-bold text-xs flex items-center justify-center shrink-0">
                      {player.position}
                    </span>
                    <div className="min-w-0">
                      <div className="font-sora font-bold text-xs text-[#0E1A2B] truncate">{player.name}</div>
                      <div className="text-[10px] text-[#66758A]">{player.club || 'Club'} • £{player.price}M</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    {isCap && (
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]" title="Captain (2x Points)">
                        C
                      </span>
                    )}
                    {isVC && (
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]" title="Vice Captain">
                        VC
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTransfers && (
        <FantasyTransfersModal
          squad={squad}
          onClose={() => setShowTransfers(false)}
          onTransferSuccess={onRefreshSquad}
          showToast={showToast}
        />
      )}

      {showHistory && (
        <FantasyTransferHistoryModal onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};
