import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function testMatch() {
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*');
  const { data: teams } = await supabase.from('fantasy_teams').select('*, fantasy_leagues(slug)');
  
  console.log('Leagues:', leagues?.length);
  console.log('Teams:', teams?.length);

  for (const leagueSlug of ['premier-league', 'la-liga', 'serie-a']) {
    const league = leagues?.find(l => l.slug === leagueSlug);
    const leagueTeams = teams?.filter(t => t.league_id === league?.id);
    console.log(`League ${leagueSlug}: ${leagueTeams?.length} teams`);
    leagueTeams?.forEach(t => console.log(` - ${t.name} (id: ${t.id})`));
  }
}

testMatch().catch(console.error);
