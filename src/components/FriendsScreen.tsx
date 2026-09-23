import React, { useState } from 'react';
import { FriendItem, ToastMessage } from '../types';
import { Users, UserPlus, Swords, Search, Radio } from 'lucide-react';

interface FriendsScreenProps {
  friends: FriendItem[];
  showToast: (msg: string, type?: ToastMessage['type']) => void;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ friends, showToast }) => {
  const [friendQuery, setFriendQuery] = useState('');

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(friendQuery.toLowerCase())
  );

  const handleChallenge = (friendName: string) => {
    showToast(`Challenge sent to ${friendName}! Waiting for acceptance.`, 'success');
  };

  const handleAddFriend = () => {
    showToast('Telegram invite link generated for friend addition!', 'success');
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sora font-extrabold text-[#0E1A2B] text-xl tracking-tight">Friends & Duo</h2>
          <p className="text-xs text-[#66758A]">Play together and compete on leaderboards.</p>
        </div>
        <button
          onClick={handleAddFriend}
          className="bg-[#2E9BFF] hover:bg-[#1d8be8] text-white p-2.5 rounded-xl shadow-sm flex items-center space-x-1.5 text-xs font-sora font-bold cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Search Friends */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66758A]" />
        <input
          type="text"
          placeholder="Search friends by name..."
          value={friendQuery}
          onChange={(e) => setFriendQuery(e.target.value)}
          className="w-full bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0E1A2B] placeholder-[#66758A] focus:outline-none focus:border-[#2E9BFF]"
        />
      </div>

      {/* Play with Friends Banner */}
      <div className="bg-gradient-to-r from-[#0B4F9E] to-[#2E9BFF] rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
        <div>
          <h3 className="font-sora font-bold text-sm">Squad Bonus</h3>
          <p className="text-xs text-white/80 mt-0.5">Play with 2+ friends to earn 2x XP rewards.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-2.5">
        <h3 className="font-sora font-bold text-[#0E1A2B] text-sm pt-2">My Contacts ({friends.length})</h3>

        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="bg-[#F0F6FC] border border-[rgba(11,79,158,0.12)] rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-11 h-11 rounded-full object-cover border border-[#2E9BFF]/30"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    friend.status === 'online'
                      ? 'bg-emerald-500'
                      : friend.status === 'in-game'
                      ? 'bg-[#2E9BFF]'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
              <div>
                <h4 className="font-sora font-bold text-[#0E1A2B] text-xs">{friend.name}</h4>
                <p className="text-[11px] text-[#66758A] mt-0.5">
                  {friend.status === 'in-game'
                    ? `Playing ${friend.gamePlaying}`
                    : friend.status === 'online'
                    ? 'Online'
                    : 'Offline'}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold bg-white text-[#0B4F9E] px-2 py-0.5 rounded-md border border-[rgba(11,79,158,0.08)]">
                  {friend.rank}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleChallenge(friend.name)}
                className="bg-white hover:bg-[#2E9BFF] hover:text-white text-[#0B4F9E] font-sora font-bold text-xs px-3 py-2 rounded-xl border border-[rgba(11,79,158,0.12)] shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Challenge</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
