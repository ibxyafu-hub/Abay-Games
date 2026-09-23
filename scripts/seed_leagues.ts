import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkLeagues() {
  const { data, error } = await supabase.from('fantasy_leagues').select('*');
  console.log('Leagues in DB:', data, error);

  if (!data || data.length === 0) {
    console.log('Seeding 3 active leagues...');
    const leaguesToInsert = [
      { id: 'league_pl', name: 'Premier League', slug: 'premier-league', country: 'England', logo_url: '' },
      { id: 'league_ll', name: 'La Liga', slug: 'la-liga', country: 'Spain', logo_url: '' },
      { id: 'league_sa', name: 'Serie A', slug: 'serie-a', country: 'Italy', logo_url: '' }
    ];
    for (const l of leaguesToInsert) {
      const { error: insErr } = await supabase.from('fantasy_leagues').upsert(l);
      if (insErr) console.error('Error inserting league:', insErr);
      else console.log(`Inserted league: ${l.name}`);
    }
  }
}

checkLeagues().catch(console.error);
