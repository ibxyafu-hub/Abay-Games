import React, { useState, useEffect } from 'react';
import { TabType, UserProfile, GameItem, MatchItem, FriendItem, ToastMessage } from './types';
import { initialUser, gamesList, initialMatches, initialFriends } from './data';
import { getGames } from './services/gameService';
import { getTelegramWebApp, isTelegramWebAppContext } from './utils/telegram';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { UserIdentityCard } from './components/UserIdentityCard';
import { HeroBanner } from './components/HeroBanner';
import { GameCarousel } from './components/GameCarousel';
import { InProgressList } from './components/InProgressList';
import { GamesScreen } from './components/GamesScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SettingsModal } from './components/SettingsModal';
import { ActiveGameModal } from './components/ActiveGameModal';
import { LudoGameScreen } from './components/LudoGameScreen';
import { ChessGameScreen } from './components/ChessGameScreen';
import { AdminPanel } from './components/AdminPanel';
import { FantasyTournamentsScreen } from './components/FantasyTournamentsScreen';
import { FantasyTournamentLobbyScreen } from './components/FantasyTournamentLobbyScreen';
import { FantasyBuilderScreen } from './components/FantasyBuilderScreen';
import { FantasyHomeScreen } from './components/FantasyHomeScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Code2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [games, setGames] = useState<GameItem[]>(gamesList);
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(true);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>(initialMatches);
  const [friends] = useState<FriendItem[]>(initialFriends);

  const [selectedGameForLobby, setSelectedGameForLobby] = useState<GameItem | null>(null);
  const [activeGameModalData, setActiveGameModalData] = useState<{ game: GameItem; matchTitle?: string } | null>(null);
  const [activeLudoMatchId, setActiveLudoMatchId] = useState<string | null>(null);
  const [activeChessMatchId, setActiveChessMatchId] = useState<string | null>(null);
  const [showFantasyTournaments, setShowFantasyTournaments] = useState<boolean>(false);
  const [showFantasyHome, setShowFantasyHome] = useState<boolean>(false);
  const [fantasySquad, setFantasySquad] = useState<any>(null);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [fantasyBuilderContext, setFantasyBuilderContext] = useState<{ leagueId: string; leagueName: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [telegramReady, setTelegramReady] = useState(false);
  const [isDevMode, setIsDevMode] = useState(true);
  const [initDataString, setInitDataString] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(window.location.pathname === '/admin/fantasy');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname === '/admin/fantasy');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const tg = getTelegramWebApp();
        const initData = tg?.initData || initDataString;
        const res = await fetch('/api/admin/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData, telegramId: user.telegramId })
        });
        const data = await res.json();
        if (data.success && data.isAdmin) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    checkAdmin();
  }, [initDataString, user.telegramId]);

  const fetchGamesFromSupabase = async () => {
    setIsLoadingGames(true);
    setGamesError(null);
    try {
      const data = await getGames();
      setGames(data);
    } catch (err: any) {
      setGamesError(err.message || 'Unable to load games. Please try again.');
    } finally {
      setIsLoadingGames(false);
    }
  };

  // Fetch games on mount
  useEffect(() => {
    fetchGamesFromSupabase();
  }, []);

  // Initialize Telegram WebApp SDK on mount and verify on backend
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        
        if (tg.initData) {
          setInitDataString(tg.initData);
          
          // Send initData to secure backend endpoint for verification and Supabase user sync
          fetch('/api/telegram/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData }),
          })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                  setUser((prev) => ({
                    ...prev,
                    telegramId: data.user.telegramId,
                    username: data.user.username,
                    displayName: data.user.displayName,
                    avatar: data.user.avatar,
                    coins: data.user.coins,
                    xp: data.user.xp,
                    level: data.user.level,
                  }));
                  setTelegramReady(true);
                  setIsDevMode(false);
                }
              } else {
                console.warn('Backend Telegram authentication failed or bot token not configured yet. Falling back to development mock user.');
              }
            })
            .catch((err) => {
              console.error('Error contacting Telegram auth backend:', err);
            });
        }
      } catch (err) {
        console.error('Error initializing Telegram WebApp:', err);
      }
    }
  }, []);

  // Handle Telegram Back Button when in lobby view
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg || !tg.BackButton) return;

    const handleBackClick = () => {
      if (selectedGameForLobby) {
        setSelectedGameForLobby(null);
      }
    };

    if (selectedGameForLobby) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBackClick);
    } else {
      tg.BackButton.hide();
      tg.BackButton.offClick(handleBackClick);
    }

    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick(handleBackClick);
      }
    };
  }, [selectedGameForLobby]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    setToast({
      id: Date.now().toString(),
      message,
      type,
    });
  };

  const handleQuickPlay = () => {
    setSelectedGameForLobby(games[0]);
  };

  const handleSelectGame = async (game: GameItem) => {
    if (game.id === 'fantasy' || game.name.toLowerCase().includes('fantasy')) {
      try {
        const initData = (window as any).Telegram?.WebApp?.initData;
        const res = await fetch('/api/fantasy/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: user.telegramId, initData })
        });
        const data = await res.json();
        if (data.success && data.onboardingCompleted && data.squad) {
          setFantasySquad(data.squad);
          setShowFantasyHome(true);
        } else {
          setFantasyBuilderContext({ leagueId: 'premier-league', leagueName: 'Premier League' });
        }
      } catch (err) {
        setFantasyBuilderContext({ leagueId: 'premier-league', leagueName: 'Premier League' });
      }
    } else {
      setSelectedGameForLobby(game);
    }
  };

  const handleResumeMatch = (match: MatchItem) => {
    const game = games.find((g) => g.id === match.gameId) || games[0];
    if (game.id === 'ludo' || game.name.toLowerCase() === 'ludo') {
      setActiveLudoMatchId(match.matchId);
    } else if (game.id === 'chess' || game.name.toLowerCase() === 'chess') {
      setActiveChessMatchId(match.matchId);
    } else {
      setActiveGameModalData({ game, matchTitle: match.gameName });
    }
  };

  const handleStartGameFromLobby = (league?: string) => {
    if (!selectedGameForLobby) return;
    const gameId = selectedGameForLobby.id.toLowerCase();
    if (gameId === 'ludo' || selectedGameForLobby.name.toLowerCase() === 'ludo') {
      const matchId = `match_ludo_${Date.now()}`;
      setSelectedGameForLobby(null);
      setActiveLudoMatchId(matchId);
    } else if (gameId === 'chess' || selectedGameForLobby.name.toLowerCase() === 'chess') {
      const matchId = `match_chess_${Date.now()}`;
      setSelectedGameForLobby(null);
      setActiveChessMatchId(matchId);
    } else {
      const matchName = league ? `${selectedGameForLobby.name} (${league})` : `${selectedGameForLobby.name} Arena`;
      setSelectedGameForLobby(null);
      setActiveGameModalData({ game: selectedGameForLobby, matchTitle: matchName });
    }
  };

  const handleRewardCoins = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      xp: prev.xp + 120,
      wins: prev.wins + 1,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  };

  const handleToggleTelegramMode = () => {
    if (isDevMode) {
      // Switch to simulated Telegram user
      setIsDevMode(false);
      setTelegramReady(true);
      setUser((prev) => ({
        ...prev,
        displayName: 'Alex (Telegram Mini App)',
        username: 'alex_tg_user',
      }));
      showToast('Switched to Telegram WebApp Simulation Mode', 'success');
    } else {
      setIsDevMode(true);
      setTelegramReady(false);
      setUser(initialUser);
      showToast('Switched to Standalone Development Mode', 'info');
    }
  };

  if (showFantasyHome) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          <FantasyHomeScreen
            currentUser={user}
            squad={fantasySquad}
            onOpenTournaments={() => {
              setShowFantasyHome(false);
              setShowFantasyTournaments(true);
            }}
            onRefreshSquad={async () => {
              try {
                const initData = (window as any).Telegram?.WebApp?.initData;
                const res = await fetch('/api/fantasy/status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ telegramId: user.telegramId, initData })
                });
                const data = await res.json();
                if (data.success && data.squad) {
                  setFantasySquad(data.squad);
                }
              } catch (e) {}
            }}
            onBack={() => setShowFantasyHome(false)}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (fantasyBuilderContext) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          <FantasyBuilderScreen
            leagueId={fantasyBuilderContext.leagueId}
            leagueName={fantasyBuilderContext.leagueName}
            onBack={() => setFantasyBuilderContext(null)}
            onSquadConfirmed={async () => {
              setFantasyBuilderContext(null);
              showToast('Squad saved successfully!', 'success');
              try {
                const initData = (window as any).Telegram?.WebApp?.initData;
                const res = await fetch('/api/fantasy/status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ telegramId: user.telegramId, initData })
                });
                const data = await res.json();
                if (data.success && data.squad) {
                  setFantasySquad(data.squad);
                  setShowFantasyHome(true);
                }
              } catch (e) {}
            }}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (activeTournamentId) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          <FantasyTournamentLobbyScreen
            tournamentId={activeTournamentId}
            currentUser={user}
            onBack={() => setActiveTournamentId(null)}
            onOpenBuilder={(leagueId, leagueName) => setFantasyBuilderContext({ leagueId, leagueName })}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (showFantasyTournaments) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          <FantasyTournamentsScreen
            currentUser={user}
            onBack={() => setShowFantasyTournaments(false)}
            onSelectTournament={(tournId) => setActiveTournamentId(tournId)}
            onOpenBuilder={(leagueId, leagueName) => setFantasyBuilderContext({ leagueId, leagueName })}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (activeLudoMatchId) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          <LudoGameScreen
            matchId={activeLudoMatchId}
            currentUser={user}
            onBack={() => setActiveLudoMatchId(null)}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (activeChessMatchId) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          <ChessGameScreen
            matchId={activeChessMatchId}
            currentUser={user}
            onBack={() => setActiveChessMatchId(null)}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (selectedGameForLobby) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          telegramReady={telegramReady}
          onToggleTelegram={handleToggleTelegramMode}
          isAdmin={isAdmin}
        />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto p-4">
          <LobbyScreen
            game={selectedGameForLobby}
            currentUser={{ displayName: user.displayName, avatar: user.avatar, username: user.username }}
            onBack={() => setSelectedGameForLobby(null)}
            onStartGame={handleStartGameFromLobby}
            showToast={showToast}
          />
        </div>
      </div>
    );
  }

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
        <Toast toast={toast} onDismiss={() => setToast(null)} />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          telegramReady={telegramReady}
          onToggleTelegram={handleToggleTelegramMode}
          isAdmin={isAdmin}
        />
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)] mx-auto">
          {isAdmin ? (
            <AdminPanel
              onBack={() => {
                window.history.pushState({}, '', '/');
                setIsAdminRoute(false);
              }}
              showToast={(msg, type) => setToast({ id: Date.now().toString(), message: msg, type: type || 'info' })}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 font-bold text-2xl">!</div>
              <h2 className="text-xl font-bold font-sora text-[#0E1A2B] mb-2">Access Denied</h2>
              <p className="text-sm text-[#66758A] mb-6">You do not have administrative privileges to access the Football Data Admin Portal.</p>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setIsAdminRoute(false);
                }}
                className="bg-[#0B4F9E] text-white px-6 py-2.5 rounded-xl font-sora font-bold text-xs cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-start text-[#0E1A2B] antialiased select-none">
      {/* Toast Notifications */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        telegramReady={telegramReady}
        onToggleTelegram={handleToggleTelegramMode}
        isAdmin={isAdmin}
      />

      {/* Active Play Modal */}
      {activeGameModalData && (
        <ActiveGameModal
          game={activeGameModalData.game}
          matchTitle={activeGameModalData.matchTitle}
          onClose={() => setActiveGameModalData(null)}
          onRewardCoins={handleRewardCoins}
          showToast={showToast}
        />
      )}

      <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-2xl overflow-hidden border-x border-[rgba(11,79,158,0.08)]">
        <div className="flex-1 flex flex-col overflow-hidden">
            {import.meta.env.DEV && isDevMode && (
              <div className="bg-[#0E1A2B] text-white px-3 py-1.5 text-[11px] flex items-center justify-between z-40 border-b border-white/10">
                <div className="flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#2E9BFF]" />
                  <span className="font-semibold">Development Mode (Standalone)</span>
                </div>
                <button
                  onClick={handleToggleTelegramMode}
                  className="text-[#2E9BFF] hover:underline font-semibold cursor-pointer text-[10px]"
                >
                  Simulate Telegram SDK
                </button>
              </div>
            )}

            {/* Main App Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <Header onOpenSettings={() => setIsSettingsOpen(true)} />

            {/* Main Scrollable Content Area */}
            <main className="flex-1 px-4 py-4 overflow-y-auto pb-24">
              <AnimatePresence mode="wait">
                {currentTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    {/* User Identity Row */}
                    <UserIdentityCard user={user} />

                    {/* Hero Banner */}
                    <HeroBanner onQuickPlay={handleQuickPlay} />

                    {/* Game Carousel */}
                    <GameCarousel
                      games={games}
                      onSelectGame={handleSelectGame}
                      isLoading={isLoadingGames}
                      error={gamesError}
                      onRetry={fetchGamesFromSupabase}
                    />

                    {/* In-Progress Matches */}
                    <InProgressList matches={matches} onResumeMatch={handleResumeMatch} />
                  </motion.div>
                )}

                {currentTab === 'games' && (
                  <motion.div
                    key="games"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <GamesScreen
                      games={games}
                      onSelectGame={handleSelectGame}
                      isLoading={isLoadingGames}
                      error={gamesError}
                      onRetry={fetchGamesFromSupabase}
                    />
                  </motion.div>
                )}

                {currentTab === 'friends' && (
                  <motion.div
                    key="friends"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <FriendsScreen friends={friends} showToast={showToast} />
                  </motion.div>
                )}

                {currentTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ProfileScreen user={user} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
