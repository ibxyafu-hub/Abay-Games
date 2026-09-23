import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../types';
import { 
  ArrowLeft, RotateCcw, Flag, Award, AlertCircle, Shield, CheckCircle2, 
  Clock, User, RefreshCw, Trophy, Sparkles, Swords, Volume2, VolumeX 
} from 'lucide-react';
import { Chess } from 'chess.js';

interface ChessGameScreenProps {
  matchId: string;
  currentUser: {
    id?: string | number;
    telegramId?: string | number;
    displayName?: string;
    avatar?: string;
  };
  onBack: () => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

// SVG Chess Piece Components
const ChessPieceSVG = ({ type, color }: { type: string; color: 'w' | 'b' }) => {
  const isWhite = color === 'w';
  
  // Clean vector chess piece graphics
  switch (type.toLowerCase()) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className="w-8 h-8 drop-shadow-sm">
          <path
            d="M 22.5 9 C 19.5 9 17.5 11 17.5 14 C 17.5 16 19 18 20.5 19 C 18.5 20.5 17 23 17 26 C 17 28.5 18.5 30.5 20 31.5 C 18 32 14 34 14 37 L 31 37 C 31 34 27 32 25 31.5 C 26.5 30.5 28 28.5 28 26 C 28 23 26.5 20.5 24.5 19 C 26 18 27.5 16 27.5 14 C 27.5 11 25.5 9 22.5 9 Z"
            fill={isWhite ? '#FFFFFF' : '#1A2b3C'}
            stroke={isWhite ? '#0B4F9E' : '#000000'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className="w-8 h-8 drop-shadow-sm">
          <path
            d="M 14 11 L 14 16 L 17 16 L 17 20 L 14 20 L 14 22 L 31 22 L 31 20 L 28 20 L 28 16 L 31 16 L 31 11 L 27 11 L 25 14 L 20 14 L 18 11 Z M 16 24 L 29 24 L 31 37 L 14 37 Z"
            fill={isWhite ? '#FFFFFF' : '#1A2b3C'}
            stroke={isWhite ? '#0B4F9E' : '#000000'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className="w-8 h-8 drop-shadow-sm">
          <path
            d="M 22 10 C 18 10 15 13 15 17 C 15 20 17 22 18 24 C 16 26 14 29 14 32 C 14 35 17 37 22 37 L 31 37 C 30 33 27 30 25 28 C 27 26 29 23 29 19 C 29 14 25 10 22 10 Z"
            fill={isWhite ? '#FFFFFF' : '#1A2b3C'}
            stroke={isWhite ? '#0B4F9E' : '#000000'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className="w-8 h-8 drop-shadow-sm">
          <path
            d="M 22.5 9 C 19 9 17 13 17 16 C 17 19 19.5 22 21 24 C 18.5 25.5 16 29 16 32 C 16 35 19 37 22.5 37 C 26 37 29 35 29 32 C 29 29 26.5 25.5 24 24 C 25.5 22 28 19 28 16 C 28 13 26 9 22.5 9 Z"
            fill={isWhite ? '#FFFFFF' : '#1A2b3C'}
            stroke={isWhite ? '#0B4F9E' : '#000000'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className="w-8 h-8 drop-shadow-sm">
          <path
            d="M 12 14 L 16 26 L 19 16 L 22.5 27 L 26 16 L 29 26 L 33 14 L 32 35 L 13 35 Z"
            fill={isWhite ? '#FFFFFF' : '#1A2b3C'}
            stroke={isWhite ? '#0B4F9E' : '#000000'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12.5" cy="13" r="1.5" fill={isWhite ? '#0B4F9E' : '#FFFFFF'} />
          <circle cx="16.5" cy="15" r="1.5" fill={isWhite ? '#0B4F9E' : '#FFFFFF'} />
          <circle cx="22.5" cy="13" r="1.5" fill={isWhite ? '#0B4F9E' : '#FFFFFF'} />
          <circle cx="28.5" cy="15" r="1.5" fill={isWhite ? '#0B4F9E' : '#FFFFFF'} />
          <circle cx="32.5" cy="13" r="1.5" fill={isWhite ? '#0B4F9E' : '#FFFFFF'} />
        </svg>
      );
    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className="w-8 h-8 drop-shadow-sm">
          <path
            d="M 22.5 9 L 22.5 15 M 19.5 12 L 25.5 12 M 16 18 L 29 18 L 31 35 L 14 35 Z"
            fill={isWhite ? '#FFFFFF' : '#1A2b3C'}
            stroke={isWhite ? '#0B4F9E' : '#000000'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

export const ChessGameScreen: React.FC<ChessGameScreenProps> = ({
  matchId,
  currentUser,
  onBack,
  showToast
}) => {
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize and poll chess game state
  useEffect(() => {
    let isMounted = true;

    const initOrPollGame = async () => {
      try {
        const userId = currentUser.id || currentUser.telegramId || 'user_' + Date.now();
        const res = await fetch('/api/chess/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, userId, userData: currentUser })
        });
        const data = await res.json();
        if (data.success && isMounted) {
          setGameState(data.gameState);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error starting/fetching chess game:', err);
      }
    };

    initOrPollGame();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chess/state?matchId=${matchId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setGameState(data.gameState);
          setLoading(false);
        }
      } catch (err) {
        console.error('Polling chess error:', err);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [matchId]);

  if (loading || !gameState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8FC] p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#0B4F9E] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-sora font-bold text-lg text-[#0E1A2B]">Entering Chess Arena...</h2>
        <p className="text-xs text-[#66758A] mt-1">Connecting to secure multiplayer server</p>
      </div>
    );
  }

  const userId = currentUser.id || currentUser.telegramId;
  const isWhitePlayer = gameState.white_player.id === userId;
  const isBlackPlayer = gameState.black_player.id === userId;
  const playerColor = isWhitePlayer ? 'w' : isBlackPlayer ? 'b' : 'w';
  const isMyTurn = gameState.turn === playerColor && gameState.status === 'active';

  // Instantiate chess.js with current FEN
  const chess = new Chess(gameState.fen);
  const board = chess.board();

  // Handle square click for moving
  const handleSquareClick = async (rowIdx: number, colIdx: number) => {
    if (!isMyTurn || gameState.status !== 'active') return;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const square = `${files[colIdx]}${ranks[rowIdx]}`;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (!selectedSquare) {
      const piece = chess.get(square as any);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
      return;
    }

    // If already selected a square, try to move
    if (legalMoves.includes(square)) {
      try {
        const res = await fetch('/api/chess/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId,
            userId,
            from: selectedSquare,
            to: square,
            promotion: 'q' // default auto-queen for clean UI
          })
        });
        const data = await res.json();
        if (data.success) {
          setGameState(data.gameState);
          setSelectedSquare(null);
          setLegalMoves([]);
          if (soundEnabled) {
            // trigger subtle feedback
          }
        } else {
          showToast(data.error || 'Invalid move', 'warning');
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } catch (err) {
        showToast('Server error executing move', 'warning');
      }
    } else {
      // Select new piece if owned
      const piece = chess.get(square as any);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const handleResign = async () => {
    if (!confirm('Are you sure you want to resign this chess match?')) return;
    try {
      const res = await fetch('/api/chess/resign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, userId })
      });
      const data = await res.json();
      if (data.success) {
        setGameState(data.gameState);
        showToast('You resigned the match', 'info');
      }
    } catch (err) {}
  };

  const myPlayerInfo = isWhitePlayer ? gameState.white_player : gameState.black_player;
  const opponentPlayerInfo = isWhitePlayer ? gameState.black_player : gameState.white_player;

  return (
    <div className="flex-1 flex flex-col bg-[#F4F8FC] select-none text-[#0E1A2B] h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-[rgba(11,79,158,0.08)] shadow-xs">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#F4F8FC] flex items-center justify-center text-[#0B4F9E] hover:bg-[#E8F1FC] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="font-sora font-bold text-sm text-[#0E1A2B] flex items-center justify-center space-x-1.5">
            <Swords className="w-4 h-4 text-[#0B4F9E]" />
            <span>Abay Chess Arena</span>
          </h1>
          <p className="text-[11px] text-[#66758A]">Match #{matchId.slice(-6)} • 2 Players</p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-9 h-9 rounded-xl bg-[#F4F8FC] flex items-center justify-center text-[#66758A] hover:bg-[#E8F1FC] transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#0B4F9E]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      <div className="flex-1 p-3 max-w-[430px] mx-auto w-full flex flex-col space-y-3">
        {/* Opponent Card */}
        <div className={`p-3 rounded-2xl flex items-center justify-between bg-white border transition-all ${
          gameState.turn !== playerColor && gameState.status === 'active' 
            ? 'border-[#0B4F9E] ring-2 ring-[#0B4F9E]/10 shadow-sm' 
            : 'border-[rgba(11,79,158,0.08)]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={opponentPlayerInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="Opponent"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isWhitePlayer ? 'bg-black' : 'bg-white border-slate-400'}`} />
            </div>
            <div>
              <h3 className="font-sora font-bold text-xs text-[#0E1A2B]">{opponentPlayerInfo?.name || 'Opponent'}</h3>
              <p className="text-[10px] text-[#66758A]">Playing as {isWhitePlayer ? 'Black (●)' : 'White (○)'}</p>
            </div>
          </div>
          {gameState.turn !== playerColor && gameState.status === 'active' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#0B4F9E]/10 text-[#0B4F9E] text-[10px] font-semibold animate-pulse">
              <Clock className="w-3 h-3" />
              <span>Thinking...</span>
            </div>
          )}
        </div>

        {/* Status Alert */}
        {gameState.status === 'finished' ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center shadow-xs">
            <div className="flex items-center justify-center space-x-2 text-amber-800 font-bold font-sora text-sm mb-1">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Game Over: {gameState.ending_reason || gameState.result}</span>
            </div>
            <p className="text-xs text-amber-700">
              Winner: {gameState.winner ? gameState.winner.name : 'Draw / Stalemate'}
            </p>
          </div>
        ) : chess.isCheck() ? (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-center flex items-center justify-center space-x-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 animate-bounce" />
            <span>Check! King under attack</span>
          </div>
        ) : null}

        {/* Chessboard 8x8 */}
        <div className="bg-white p-3 rounded-2xl shadow-md border border-[rgba(11,79,158,0.08)] flex flex-col items-center">
          <div className="grid grid-cols-8 w-full aspect-square border-2 border-[#0B4F9E] rounded-xl overflow-hidden shadow-inner">
            {(isWhitePlayer ? board : [...board].reverse()).map((row, rIdx) => {
              const actualRowIdx = isWhitePlayer ? rIdx : 7 - rIdx;
              return (
                isWhitePlayer ? row : [...row].reverse()
              ).map((piece, cIdx) => {
                const actualColIdx = isWhitePlayer ? cIdx : 7 - cIdx;
                const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
                const squareName = `${files[actualColIdx]}${ranks[actualRowIdx]}`;
                const isLight = (actualRowIdx + actualColIdx) % 2 === 0;
                const isSelected = selectedSquare === squareName;
                const isLegalTarget = legalMoves.includes(squareName);

                return (
                  <div
                    key={squareName}
                    onClick={() => handleSquareClick(actualRowIdx, actualColIdx)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors aspect-square ${
                      isLight ? 'bg-[#EBF3FC]' : 'bg-[#0B4F9E]/20'
                    } ${isSelected ? 'ring-2 ring-[#0B4F9E] bg-blue-200/60' : ''}`}
                  >
                    {piece && (
                      <div className="transform transition-transform hover:scale-110">
                        <ChessPieceSVG type={piece.type} color={piece.color} />
                      </div>
                    )}
                    {isLegalTarget && (
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-[#0B4F9E] opacity-75 animate-ping" />
                    )}
                    {isLegalTarget && !piece && (
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-[#0B4F9E]" />
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* Current User Card */}
        <div className={`p-3 rounded-2xl flex items-center justify-between bg-white border transition-all ${
          gameState.turn === playerColor && gameState.status === 'active' 
            ? 'border-[#0B4F9E] ring-2 ring-[#0B4F9E]/10 shadow-sm' 
            : 'border-[rgba(11,79,158,0.08)]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={myPlayerInfo?.avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="You"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#0B4F9E]"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isWhitePlayer ? 'bg-white border-slate-400' : 'bg-black'}`} />
            </div>
            <div>
              <h3 className="font-sora font-bold text-xs text-[#0E1A2B]">You ({myPlayerInfo?.name || 'Player'})</h3>
              <p className="text-[10px] text-[#66758A]">Playing as {isWhitePlayer ? 'White (○)' : 'Black (●)'}</p>
            </div>
          </div>
          {gameState.status === 'active' && (
            <button
              onClick={handleResign}
              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-sora font-semibold text-[11px] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Resign</span>
            </button>
          )}
        </div>

        {/* Move History / Notation */}
        <div className="bg-white p-3 rounded-2xl border border-[rgba(11,79,158,0.08)] shadow-xs">
          <h4 className="font-sora font-bold text-xs text-[#0E1A2B] mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0B4F9E]" />
            <span>Move History</span>
          </h4>
          <div className="max-h-24 overflow-y-auto text-xs font-mono bg-[#F4F8FC] p-2 rounded-xl flex flex-wrap gap-1.5 text-[#66758A]">
            {gameState.move_history && gameState.move_history.length > 0 ? (
              gameState.move_history.map((m: string, i: number) => (
                <span key={i} className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{m}
                </span>
              ))
            ) : (
              <span className="text-gray-400 italic">No moves played yet. White to move.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
