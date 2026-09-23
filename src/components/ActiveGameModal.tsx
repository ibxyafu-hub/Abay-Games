import React from 'react';
import { GameItem, ToastMessage } from '../types';
import { X, Users, Sparkles, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface ActiveGameModalProps {
  game: GameItem | null;
  matchTitle?: string;
  onClose: () => void;
  onRewardCoins: (amount: number) => void;
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const ActiveGameModal: React.FC<ActiveGameModalProps> = ({
  game,
  matchTitle,
  onClose,
}) => {
  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[rgba(11,79,158,0.15)] text-center relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: game.accentColor }}
            />
            <h3 className="font-sora font-bold text-[#0E1A2B] text-base">
              {matchTitle || game.name + ' Match Room'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F6FC] hover:bg-[#E3EEFA] flex items-center justify-center text-[#66758A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Match Waiting / Lobby Body */}
        <div className="space-y-5 py-4">
          <div className="w-16 h-16 mx-auto bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] text-[#2E9BFF] rounded-2xl flex items-center justify-center shadow-inner">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h4 className="font-sora font-bold text-[#0E1A2B] text-sm">Match Created in Supabase</h4>
            <p className="text-xs text-[#66758A] mt-1.5 leading-relaxed">
              Your match session is active and registered on the server. Waiting for opponent connections and player synchronization.
            </p>
          </div>

          <div className="bg-[#F0F6FC] rounded-2xl p-4 border border-[rgba(11,79,158,0.1)] text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#66758A]">Game:</span>
              <span className="font-semibold text-[#0E1A2B]">{game.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#66758A]">Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                <span>Waiting for players</span>
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#66758A]">Authentication:</span>
              <span className="font-semibold text-[#0B4F9E]">Verified Supabase User</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#0B4F9E] hover:bg-[#093d7c] text-white font-sora font-bold py-3.5 rounded-2xl shadow-md cursor-pointer text-xs transition-transform active:scale-98"
          >
            Return to Dashboard / In-Progress Matches
          </button>
        </div>
      </motion.div>
    </div>
  );
};

