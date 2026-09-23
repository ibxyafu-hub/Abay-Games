export interface FantasyLeague {
  id: string;
  name: string;
  slug: string;
  description?: string;
  accentColor?: string;
}

export interface FantasyPlayer {
  id: string;
  name: string;
  club: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  price: number;
  points: number;
  avatar?: string;
  leagueId?: string;
}

export type TabType = 'home' | 'games' | 'friends' | 'profile';

export interface UserProfile {
  telegramId: number;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  xp: number;
  level: number;
  rank: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

export interface GameItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  minPlayers: number;
  maxPlayers: number;
  status: string;
  iconName: string;
  category: 'board' | 'strategy' | 'sports';
  rating: number;
  activePlayersCount: number;
}

export interface MatchItem {
  matchId: string;
  gameId: string;
  gameName: string;
  playersText: string;
  status: 'LIVE' | 'WAITING' | 'FINISHED';
  accentColor: string;
}

export interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'in-game' | 'offline';
  gamePlaying?: string;
  rank: string;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost?: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}
