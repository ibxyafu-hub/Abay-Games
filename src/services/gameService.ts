import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GameItem, FantasyLeague } from '../types';
import { gamesList } from '../data';

export const fallbackFantasyLeagues: FantasyLeague[] = [
  { id: 'epl', name: 'English Premier League', slug: 'premier-league', accentColor: '#37003c' },
  { id: 'laliga', name: 'La Liga', slug: 'la-liga', accentColor: '#ff2882' },
  { id: 'seriea', name: 'Serie A', slug: 'serie-a', accentColor: '#024494' },
];

export async function getGames(): Promise<GameItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return gamesList;
  }

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase getGames error:', error);
      throw new Error('Unable to load games. Please try again.');
    }

    if (!data || data.length === 0) {
      return gamesList;
    }

    const filtered = data
      .map((item: any) => ({
        id: item.id || item.slug,
        name: item.name,
        tagline: item.tagline || 'Multiplayer Game',
        description: item.description,
        accentColor: item.accent_color || item.accentColor || '#2E9BFF',
        minPlayers: item.min_players ?? item.minPlayers ?? 2,
        maxPlayers: item.max_players ?? item.maxPlayers ?? 4,
        status: item.status || 'Active',
        iconName: item.icon_name || item.iconName || 'Dices',
        category: item.category || 'board',
        rating: item.rating ?? 4.8,
        activePlayersCount: item.active_players_count ?? 1000,
      }))
      .filter((g: GameItem) => {
        const idLower = g.id.toLowerCase();
        const nameLower = g.name.toLowerCase();
        return idLower !== 'unchase' && nameLower !== 'unchase';
      });

    return filtered.length > 0 ? filtered : gamesList;
  } catch (err) {
    console.error('Failed to fetch games from Supabase:', err);
    throw new Error('Unable to load games. Please try again.');
  }
}

export async function getGameById(id: string): Promise<GameItem | null> {
  const games = await getGames();
  return games.find((g) => g.id === id || g.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function getGameBySlug(slug: string): Promise<GameItem | null> {
  const games = await getGames();
  return games.find((g) => g.id === slug || g.name.toLowerCase() === slug.toLowerCase()) || null;
}

export async function getFantasyLeagues(): Promise<FantasyLeague[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackFantasyLeagues;
  }

  try {
    const { data, error } = await supabase
      .from('fantasy_leagues')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      // If table doesn't exist yet (PGRST205) or any other query issue, gracefully use fallback
      return fallbackFantasyLeagues;
    }

    if (!data || data.length === 0) {
      return fallbackFantasyLeagues;
    }

    const mappedLeagues = data.map((item: any) => ({
      id: item.id || item.slug,
      name: item.name,
      slug: item.slug,
      description: item.description,
      accentColor: item.accent_color || '#0B4F9E',
    }));

    // Ensure we only show English Premier League, La Liga, Serie A
    const targetNames = ['english premier league', 'la liga', 'serie a', 'premier league'];
    const filteredLeagues = mappedLeagues.filter((l) =>
      targetNames.some((t) => l.name.toLowerCase().includes(t) || l.slug.toLowerCase().includes(t))
    );

    return filteredLeagues.length > 0 ? filteredLeagues : fallbackFantasyLeagues;
  } catch (err) {
    return fallbackFantasyLeagues;
  }
}
