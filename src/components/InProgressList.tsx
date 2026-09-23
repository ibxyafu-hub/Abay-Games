import React from 'react';
import { MatchItem } from '../types';
import { Radio, ArrowRight } from 'lucide-react';

interface InProgressListProps {
  matches: MatchItem[];
  onResumeMatch: (match: MatchItem) => void;
}

export const InProgressList: React.FC<InProgressListProps> = ({ matches, onResumeMatch }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sora font-bold text-[#0E1A2B] text-sm">In Progress</h3>
        <span className="text-xs text-[#66758A]">{matches.length} active</span>
      </div>

      <div className="space-y-2.5">
        {matches.map((match) => (
          <div
            key={match.matchId}
            onClick={() => onResumeMatch(match)}
            className="bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] rounded-2xl p-3.5 flex items-center justify-between shadow-xs transition-all cursor-pointer active:scale-99"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-sora font-bold text-sm shadow-sm"
                style={{ backgroundColor: match.accentColor }}
              >
                {match.gameName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-sora font-bold text-[#0E1A2B] text-xs">{match.gameName}</h4>
                  {match.status === 'LIVE' && (
                    <span className="inline-flex items-center space-x-1 bg-[#FF5A6E]/15 text-[#FF5A6E] px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A6E] animate-pulse-subtle" />
                      <span>LIVE</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#66758A] mt-0.5">{match.playersText}</p>
              </div>
            </div>

            <button
              className="bg-white text-[#0B4F9E] hover:bg-[#2E9BFF] hover:text-white font-sora font-bold text-xs px-3.5 py-2 rounded-xl border border-[rgba(11,79,158,0.12)] shadow-xs flex items-center space-x-1 transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
