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
    
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/${fileKey}.json`;
    const res = await fetch(url);
    const data = await res.json();
    const matches = data.matches || [];

    let unmatchedTeams = new Set<string>();
    let matchedCount = 0;

    for (const m of matches) {
      const t1 = m.team1;
      const t2 = m.team2;
      
      const findTeam = (name: string) => {
        let clean = name.replace(/ FC| CF| Calcio| 1907| Ssc| As /gi, '').trim().toLowerCase();
        return leagueTeams.find(t => t.name.toLowerCase() === name.toLowerCase() || t.name.toLowerCase() === clean || t.name.toLowerCase().includes(clean) || clean.includes(t.name.toLowerCase()));
      };

      if (findTeam(t1)) matchedCount++; else unmatchedTeams.add(t1);
      if (findTeam(t2)) matchedCount++; else unmatchedTeams.add(t2);
    }

    console.log(`League: ${leagueSlug}, Matches: ${matches.length}, Unmatched team names:`, Array.from(unmatchedTeams));
  }
}

testMapping().catch(console.error);
