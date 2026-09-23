import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../types';
import { ArrowLeft, Dices, Trophy, RefreshCw, Shield, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LudoGameScreenProps {
  matchId: string;
  currentUser: { id?: string; displayName: string; avatar: string; username: string };
  onBack: () => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

export const LudoGameScreen: React.FC<LudoGameScreenProps> = ({
  matchId,
  currentUser,
  onBack,
  showToast,
}) => {
  const [gameState, setGameState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch(`/api/ludo/state?matchId=${matchId}`);
      const data = await res.json();
      if (data.success && data.gameState) {
        setGameState(data.gameState);
      }
    } catch (err) {
      console.error('Error fetching Ludo state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize or start game
    const initGame = async () => {
      try {
        const initData = (window as any).Telegram?.WebApp?.initData;
        const res = await fetch('/api/ludo/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, initData }),
        });
        const data = await res.json();
        if (data.success && data.gameState) {
          setGameState(data.gameState);
        }
      } catch (err) {
        console.error('Error starting Ludo game:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initGame();

    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [matchId]);

  const handleRollDice = async () => {
    if (isRolling || !gameState) return;
    const currentTurnPlayer = gameState.players[gameState.current_turn];
    const isMyTurn = currentTurnPlayer && (currentTurnPlayer.id === currentUser.id || currentTurnPlayer.id === currentUser.username || currentTurnPlayer.name === currentUser.displayName);

    if (!isMyTurn) {
      showToast("It's not your turn!", 'warning');
      return;
    }

    if (gameState.rolled_this_turn) {
      showToast("You already rolled. Select a token to move.", 'info');
      return;
    }

    setIsRolling(true);
    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/ludo/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, initData }),
      });
      const data = await res.json();
      if (data.success && data.gameState) {
        setGameState(data.gameState);
        if (data.message) {
          showToast(data.message, 'info');
        }
      } else {
        showToast(data.error || 'Failed to roll dice', 'warning');
      }
    } catch (err) {
      showToast('Error rolling dice', 'warning');
    } finally {
      setIsRolling(false);
    }
  };

  const handleMoveToken = async (tokenIndex: number) => {
    if (!gameState) return;
    const currentTurnPlayer = gameState.players[gameState.current_turn];
    const isMyTurn = currentTurnPlayer && (currentTurnPlayer.id === currentUser.id || currentTurnPlayer.id === currentUser.username || currentTurnPlayer.name === currentUser.displayName);

    if (!isMyTurn) {
      showToast("It's not your turn!", 'warning');
      return;
    }

    if (!gameState.rolled_this_turn) {
      showToast("Roll the dice first!", 'warning');
      return;
    }

    try {
      const initData = (window as any).Telegram?.WebApp?.initData;
      const res = await fetch('/api/ludo/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, tokenIndex, initData }),
      });
      const data = await res.json();
      if (data.success && data.gameState) {
        setGameState(data.gameState);
        setSelectedToken(null);
        if (data.message) {
          showToast(data.message, 'success');
        }
      } else {
        showToast(data.error || 'Invalid move', 'warning');
      }
    } catch (err) {
      showToast('Error making move', 'warning');
    }
  };

  if (isLoading || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#2E9BFF] animate-spin" />
        <p className="font-sora text-sm text-[#66758A]">Loading Ludo Match Arena...</p>
      </div>
    );
  }

  const currentTurnPlayer = gameState.players[gameState.current_turn];
  const isMyTurn = currentTurnPlayer && (currentTurnPlayer.id === currentUser.id || currentTurnPlayer.id === currentUser.username || currentTurnPlayer.name === currentUser.displayName);
  const myPlayerObj = gameState.players.find((p: any) => p.id === currentUser.id || p.name === currentUser.displayName) || gameState.players[0];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-rose-500 text-white border-rose-600';
      case 'green': return 'bg-emerald-500 text-white border-emerald-600';
      case 'yellow': return 'bg-amber-400 text-slate-900 border-amber-500';
      case 'blue': return 'bg-sky-500 text-white border-sky-600';
      default: return 'bg-slate-400 text-white border-slate-500';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 shadow-2xs">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#F0F6FC] hover:bg-[#E3EEFA] border border-[rgba(11,79,158,0.12)] flex items-center justify-center text-[#0E1A2B] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="font-sora font-bold text-sm text-[#0E1A2B]">Ludo Championship Arena</h2>
          <p className="text-[11px] text-[#66758A]">Match #{matchId.substring(0, 8)}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Players Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {gameState.players.map((p: any, idx: number) => {
            const isCurrent = gameState.current_turn === idx;
            return (
              <div
                key={p.id || idx}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  isCurrent ? 'bg-white border-[#2E9BFF] ring-2 ring-[#2E9BFF]/20 shadow-md scale-102' : 'bg-white/80 border-slate-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${getColorClass(p.color)} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="font-sora font-bold text-xs truncate text-[#0E1A2B]">{p.name}</p>
                  <p className="text-[10px] text-[#66758A]">
                    {p.tokens.filter((t: any) => t.position === 57).length}/4 Finished
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Turn & Dice Action Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCurrentTurnMyPlayer() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-sora font-bold text-xs text-[#0E1A2B]">
                {isMyTurn ? "Your Turn!" : `${currentTurnPlayer?.name}'s Turn`}
              </span>
            </div>
            <p className="text-[11px] text-[#66758A] mt-0.5">
              {gameState.rolled_this_turn ? 'Choose a token to move' : 'Roll the dice to advance'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#F0F6FC] rounded-xl border border-[#2E9BFF]/30 flex items-center justify-center font-sora font-extrabold text-lg text-[#0E1A2B] shadow-inner">
              {isRolling ? <RefreshCw className="w-5 h-5 animate-spin text-[#2E9BFF]" /> : (gameState.dice_value || '🎲')}
            </div>

            <button
              onClick={handleRollDice}
              disabled={isRolling || !isMyTurn || gameState.rolled_this_turn || gameState.status === 'finished'}
              className={`px-4 py-3 rounded-xl font-sora font-bold text-xs shadow-md transition-all cursor-pointer ${
                isMyTurn && !gameState.rolled_this_turn && gameState.status !== 'finished'
                  ? 'bg-[#2E9BFF] hover:bg-[#1d8be8] text-white shadow-[#2E9BFF]/30 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          </div>
        </div>

        {/* Interactive Ludo Board */}
        <div className="bg-[#0E1A2B] rounded-3xl p-4 shadow-xl border-4 border-[#1a2f4c] relative overflow-hidden aspect-square flex flex-col justify-between">
          {/* Header grid representation */}
          <div className="text-center py-2 text-white/80 font-sora text-xs tracking-wider uppercase">
            Abay Games Ludo Grid
          </div>

          {/* Board Center / Yards container */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {gameState.players.map((p: any, pIdx: number) => (
              <div
                key={p.color}
                className={`rounded-2xl p-3 border-2 flex flex-col justify-between relative ${
                  p.color === 'red' ? 'bg-rose-950/40 border-rose-500/40' :
                  p.color === 'green' ? 'bg-emerald-950/40 border-emerald-500/40' :
                  p.color === 'yellow' ? 'bg-amber-950/40 border-amber-500/40' :
                  'bg-sky-950/40 border-sky-500/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-sora font-bold text-xs text-white/90 capitalize">{p.name} ({p.color})</span>
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">
                    {p.tokens.filter((t: any) => t.position === 57).length}/4
                  </span>
                </div>

                {/* Token Yard & Track representation */}
                <div className="grid grid-cols-2 gap-2 my-auto">
                  {p.tokens.map((token: any) => {
                    const isMyToken = isMyTurn && gameState.rolled_this_turn && p.id === myPlayerObj.id;
                    const canMoveToken = isMyToken && (token.position !== 57);

                    return (
                      <motion.button
                        key={token.id}
                        whileHover={canMoveToken ? { scale: 1.12 } : {}}
                        whileTap={canMoveToken ? { scale: 0.95 } : {}}
                        onClick={() => canMoveToken && handleMoveToken(token.id)}
                        disabled={!canMoveToken}
                        className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
                          getColorClass(p.color)
                        } ${canMoveToken ? 'ring-4 ring-white animate-bounce cursor-pointer' : 'opacity-90 cursor-default'}`}
                        title={`Token ${token.id + 1}: Pos ${token.position}`}
                      >
                        {token.position === -1 ? '🏠' : token.position === 57 ? '👑' : token.position}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-white/60 text-center">
                  {p.tokens.every((t: any) => t.position === -1) ? 'Roll 6 to start' : 'Tokens active'}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-white/50 pt-2">
            Server-Authoritative Engine • Realtime Synchronized
          </div>
        </div>

        {/* Game Over Screen */}
        {gameState.status === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-md">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-[#0E1A2B] text-xl">Match Concluded!</h3>
              <p className="text-xs text-[#66758A] mt-1">
                Winner: <span className="font-bold text-[#0B4F9E]">{gameState.winner?.name || 'Player'}</span>
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full bg-[#0B4F9E] hover:bg-[#093d7c] text-white font-sora font-bold py-3.5 rounded-2xl shadow-md cursor-pointer text-xs"
            >
              Return to Lobby
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );

  function isCurrentTurnMyPlayer() {
    return currentTurnPlayer && (currentTurnPlayer.id === currentUser.id || currentTurnPlayer.id === currentUser.username || currentTurnPlayer.name === currentUser.displayName);
  }
};
