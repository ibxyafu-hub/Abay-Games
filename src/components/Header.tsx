import React from 'react';
import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[rgba(11,79,158,0.1)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E9BFF] to-[#0B4F9E] flex items-center justify-center shadow-md shadow-[#2E9BFF]/20 text-white font-sora font-bold text-lg">
          A
        </div>
        <div>
          <h1 className="font-sora font-bold text-[#0E1A2B] text-base leading-tight">
            Abay Games
          </h1>
          <p className="text-[11px] text-[#66758A] leading-none">Play. Compete. Connect.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] flex items-center justify-center text-[#0E1A2B] transition-transform active:scale-95 cursor-pointer"
          aria-label="Settings and Notifications"
        >
          <Bell className="w-4 h-4 text-[#0B4F9E]" />
        </button>
      </div>
    </header>
  );
};
