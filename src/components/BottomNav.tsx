import React from 'react';
import { Home, Gamepad2, Users, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-[rgba(11,79,158,0.12)] px-4 py-2 shadow-lg shadow-black/5">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 transition-all duration-300 cursor-pointer ${
                isActive ? '-translate-y-1 text-[#2E9BFF]' : 'text-[#66758A] hover:text-[#0E1A2B]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-1.5 h-1.5 bg-[#2E9BFF] rounded-full shadow-sm shadow-[#2E9BFF]" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[11px] font-medium mt-1 ${isActive ? 'font-semibold text-[#0E1A2B]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
