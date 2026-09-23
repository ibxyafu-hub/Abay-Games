import React from 'react';
import { UserProfile, ToastMessage } from '../types';
import { Trophy, Shield, Sparkles, ArrowRight, CheckCircle2, Coins } from 'lucide-react';
import { motion } from 'motion/react';

interface FantasyOnboardingWelcomeProps {
  currentUser: UserProfile;
  onStartBuilder: () => void;
  onBack: () => void;
}

export const FantasyOnboardingWelcome: React.FC<FantasyOnboardingWelcomeProps> = ({
  currentUser,
  onStartBuilder,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-[#F0F6FC] text-[#0E1A2B] flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full space-y-6 pt-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-sora font-bold text-[#66758A] hover:text-[#0E1A2B] cursor-pointer"
          >
            ← Back to Home
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0B4F9E]/10 text-[#0B4F9E] px-2.5 py-1 rounded-full">
            Fantasy Onboarding
          </span>
        </div>

        {/* Hero Illustration / Icon */}
        <div className="bg-gradient-to-br from-[#0B4F9E] to-[#2E9BFF] rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Trophy className="w-48 h-48" />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-white shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1 relative z-10">
            <h2 className="font-sora font-extrabold text-2xl tracking-tight">Welcome to Abay Fantasy</h2>
            <p className="text-xs text-white/90 max-w-[280px] mx-auto">
              Build your permanent 11-player squad and compete in 50-player tournament cups.
            </p>
          </div>
        </div>

        {/* Starting Budget Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E3EEFA] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#66758A] uppercase tracking-wider">Starting Budget</div>
              <div className="font-sora font-extrabold text-xl text-[#0E1A2B]">100.0M</div>
            </div>
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
            Granted Once
          </span>
        </div>

        {/* Rules Checklist */}
        <div className="bg-white rounded-2xl p-5 border border-[#E3EEFA] shadow-xs space-y-3">
          <div className="font-sora font-bold text-sm text-[#0E1A2B]">Squad Requirements (11 Players):</div>
          <div className="space-y-2 text-xs text-[#66758A]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Exact Formation: 1 GK, 3–5 DEF, 3–5 MID, 1–3 FWD</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Total value must be ≤ 100.0M</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Select 1 Captain and 1 Vice-Captain (different players)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="max-w-md mx-auto w-full pt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStartBuilder}
          className="w-full py-4 bg-[#0B4F9E] hover:bg-[#0a4185] text-white rounded-2xl font-sora font-bold text-sm shadow-xl shadow-[#0B4F9E]/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>Build Your Fantasy Team</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};
