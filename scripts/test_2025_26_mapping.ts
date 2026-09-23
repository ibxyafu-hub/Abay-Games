import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function testMapping() {
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*');
  const { data: teams } = await supabase.from('fantasy_teams').select('*, fantasy_leagues(slug)');

  const leagueMap: Record<string, string> = {
    'en.1': 'premier-league',
    'es.1': 'la-liga',
    'it.1': 'serie-a'
  };

  for (const [fileKey, leagueSlug] of Object.entries(leagueMap)) {
    const league = leagues?.find(l => l.slug === leagueSlug);
    const leagueTeams = teams?.filter(t => t.league_id === league?.id) || [];
    
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/2025-26/${fileKey}.json`;
    const res = await fetch(url);
    const data = await res.json();
    const matches = data.matches || [];

    let unmatchedTeams = new Set<string>();
    let matchedCount = 0;

    for (const m of matches) {
      const normalize = (str: string) => {
        return str
          .replace(/ FC| CF| Calcio| 1907| Ssc| As| SAD| CFC| AFC/gi, '')
          .replace(/&amp;/g, '&')
          .trim()
          .toLowerCase();
      };

      const findTeam = (name: string) => {
        const normName = normalize(name);
        return leagueTeams.find(t => {
          const normDb = normalize(t.name);
          return normDb === normName || normDb.includes(normName) || normName.includes(normDb);
        });
      };

      if (findTeam(m.team1)) matchedCount++; else unmatchedTeams.add(m.team1);
      if (findTeam(m.team2)) matchedCount++; else unmatchedTeams.add(m.team2);
    }

    console.log(`League: ${leagueSlug}, Matches: ${matches.length}, Matched: ${matchedCount}/760, Unmatched team names:`, Array.from(unmatchedTeams));
  }
}

testMapping().catch(console.error);
