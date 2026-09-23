import React from 'react';
import { X, Bell, Shield, Smartphone, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramReady: boolean;
  onToggleTelegram: () => void;
  isAdmin: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  telegramReady,
  onToggleTelegram,
  isAdmin,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.9, 0.32, 1] }}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-[rgba(11,79,158,0.12)] space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(11,79,158,0.1)]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E9BFF] to-[#0B4F9E] flex items-center justify-center text-white font-sora font-bold text-sm">
                  A
                </div>
                <h3 className="font-sora font-bold text-[#0E1A2B] text-base">Abay Games Settings</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F0F6FC] hover:bg-[#E3EEFA] flex items-center justify-center text-[#66758A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telegram Mini App Status (Development only simulator controls) */}
            {import.meta.env.DEV && (
              <div className="bg-[#F0F6FC] p-4 rounded-2xl border border-[rgba(11,79,158,0.12)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-[#2E9BFF]" />
                    <span className="font-sora font-bold text-xs text-[#0E1A2B]">Telegram WebApp SDK</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      telegramReady ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                    }`}
                  >
                    {telegramReady ? 'Connected' : 'Simulation Mode'}
                  </span>
                </div>
                <p className="text-[11px] text-[#66758A]">
                  {telegramReady
                    ? 'Connected to Telegram Cloud & User Session verified.'
                    : 'Running in standalone browser test mode with mock Telegram identity.'}
                </p>
                <button
                  onClick={onToggleTelegram}
                  className="w-full mt-2 bg-white hover:bg-[#E3EEFA] text-[#0B4F9E] text-xs font-sora font-bold py-2 rounded-xl border border-[rgba(11,79,158,0.12)] shadow-xs transition-colors cursor-pointer"
                >
                  {telegramReady ? 'Switch to Simulation Mode' : 'Connect Telegram SDK'}
                </button>
              </div>
            )}

            {/* General Preferences */}
            <div className="space-y-3 pt-2">
              <h4 className="font-sora font-bold text-[#0E1A2B] text-xs uppercase tracking-wider">Preferences</h4>

              <div className="flex items-center justify-between bg-[#F0F6FC] p-3 rounded-xl border border-[rgba(11,79,158,0.08)]">
                <div className="flex items-center space-x-2.5">
                  <Bell className="w-4 h-4 text-[#0B4F9E]" />
                  <span className="text-xs font-medium text-[#0E1A2B]">Push Notifications</span>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#2E9BFF] w-4 h-4 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between bg-[#F0F6FC] p-3 rounded-xl border border-[rgba(11,79,158,0.08)]">
                <div className="flex items-center space-x-2.5">
                  <Globe className="w-4 h-4 text-[#17B8D6]" />
                  <span className="text-xs font-medium text-[#0E1A2B]">Language / ቋንቋ</span>
                </div>
                <span className="text-xs font-semibold text-[#2E9BFF]">English (US)</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    window.history.pushState({}, '', '/admin/fantasy');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="w-full bg-[#0B4F9E] hover:bg-[#093d7e] text-white font-sora font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-[#2E9BFF]" /> Open Football Data Admin Portal
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full bg-[#2E9BFF] hover:bg-[#1d8be8] text-white font-sora font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
