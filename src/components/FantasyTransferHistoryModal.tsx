import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface FantasyTransferHistoryModalProps {
  onClose: () => void;
}

export const FantasyTransferHistoryModal: React.FC<FantasyTransferHistoryModalProps> = ({ onClose }) => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/fantasy/transfers')
      .then(async (res) => {
        const data = await res.json();
        if (data.success && data.transfers) {
          setTransfers(data.transfers);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E3EEFA] flex flex-col max-h-[85vh]"
      >
        <div className="bg-[#0B4F9E] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#2E9BFF]" />
            <h3 className="font-sora font-bold text-base">Transfer History</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#66758A]">Loading transfer history...</div>
          ) : transfers.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#66758A]">No transfers made yet. Your permanent squad is pristine!</div>
          ) : (
            transfers.map((tx: any, idx: number) => (
              <div key={tx.id || idx} className="bg-[#F0F6FC] border border-[#E3EEFA] rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-[#66758A] text-[10px]">
                  <span>Transfer #{transfers.length - idx}</span>
                  <span>{new Date(tx.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-red-600 uppercase">Out</div>
                    <div className="font-sora font-bold text-[#0E1A2B] truncate">{tx.player_out_id}</div>
                    <div className="text-[10px] text-[#66758A]">£{tx.price_out}M</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">In</div>
                    <div className="font-sora font-bold text-[#0E1A2B] truncate">{tx.player_in_id}</div>
                    <div className="text-[10px] text-[#66758A]">£{tx.price_in}M</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
