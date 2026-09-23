import { UserProfile, GameItem, MatchItem, FriendItem } from './types';

export const initialUser: UserProfile = {
  telegramId: 89341209,
  username: 'alex_abay',
  displayName: 'Alex Tadesse',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  coins: 2450,
  xp: 4800,
  level: 14,
  rank: 'Gold Rank',
  gamesPlayed: 142,
  wins: 96,
  losses: 46,
};

export const gamesList: GameItem[] = [
  {
    id: 'ludo',
    name: 'Ludo',
    tagline: 'Classic Board Action',
    description: 'Multiplayer board game with live dice rolls & instant chat.',
    accentColor: '#2E9BFF',
    minPlayers: 2,
    maxPlayers: 4,
    status: 'Active',
    iconName: 'Dices',
    category: 'board',
    rating: 4.9,
    activePlayersCount: 1240,
  },
  {
    id: 'chess',
    name: 'Chess',
    tagline: 'Tactical Grandmaster Duel',
    description: 'Turn-based classic strategy chess match with live timer.',
    accentColor: '#17B8D6',
    minPlayers: 2,
    maxPlayers: 2,
    status: 'Popular',
    iconName: 'Compass',
    category: 'strategy',
    rating: 4.9,
    activePlayersCount: 1850,
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    tagline: 'Premier League Manager',
    description: 'Build your dream football squad and compete in weekly leagues.',
    accentColor: '#0B4F9E',
    minPlayers: 2,
    maxPlayers: 10,
    status: 'Live Drafts',
    iconName: 'Trophy',
    category: 'sports',
    rating: 4.8,
    activePlayersCount: 3120,
  },
];

export const initialMatches: MatchItem[] = [
  {
    matchId: 'm-1',
    gameId: 'ludo',
    gameName: 'Ludo Classic',
    playersText: 'You + 2 players',
    status: 'LIVE',
    accentColor: '#2E9BFF',
  },
  {
    matchId: 'm-2',
    gameId: 'fantasy',
    gameName: 'Fantasy League GW 8',
    playersText: 'H2H vs Dawit',
    status: 'LIVE',
    accentColor: '#0B4F9E',
  },
];

export const initialFriends: FriendItem[] = [
  {
    id: 'f-1',
    name: 'Dawit Mekonnen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    gamePlaying: 'Ludo',
    rank: 'Diamond III',
  },
  {
    id: 'f-2',
    name: 'Sara Kassa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'in-game',
    gamePlaying: 'Fantasy League',
    rank: 'Platinum I',
  },
  {
    id: 'f-3',
    name: 'Michael Berhane',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    rank: 'Gold II',
  },
  {
    id: 'f-4',
    name: 'Bethlehem Tadesse',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    rank: 'Silver IV',
  },
];
