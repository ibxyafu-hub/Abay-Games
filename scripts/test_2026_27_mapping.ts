import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

const TEAM_ALIASES: Record<string, string> = {
  // Premier League
  'arsenal fc': 'Arsenal',
  'aston villa fc': 'Aston Villa',
  'afc bournemouth': 'Bournemouth',
  'brentford fc': 'Brentford',
  'brighton & hove albion fc': 'Brighton & Hove Albion',
  'chelsea fc': 'Chelsea',
  'crystal palace fc': 'Crystal Palace',
  'everton fc': 'Everton',
  'fulham fc': 'Fulham',
  'ipswich town fc': 'Ipswich Town',
  'leicester city fc': 'Leicester City',
  'liverpool fc': 'Liverpool',
  'manchester city fc': 'Manchester City',
  'manchester united fc': 'Manchester United',
  'newcastle united fc': 'Newcastle United',
  'nottingham forest fc': 'Nottingham Forest',
  'southampton fc': 'Southampton',
  'tottenham hotspur fc': 'Tottenham Hotspur',
  'west ham united fc': 'West Ham United',
  'wolverhampton wanderers fc': 'Wolverhampton Wanderers',

  // La Liga
  'deportivo alavés': 'Alavés',
  'athletic club': 'Athletic Bilbao',
  'club atlético de madrid': 'Atlético Madrid',
  'fc barcelona': 'Barcelona',
  'rc celta de vigo': 'Celta Vigo',
  'rcd espanyol': 'Espanyol',
  'getafe cf': 'Getafe',
  'girona fc': 'Girona',
  'ud las palmas': 'Las Palmas',
  'rcd mallorca': 'Mallorca',
  'ca osasuna': 'Osasuna',
  'rayo vallecano': 'Rayo Vallecano',
  'real betis': 'Real Betis',
  'real madrid cf': 'Real Madrid',
  'real sociedad': 'Real Sociedad',
  'sevilla fc': 'Sevilla',
  'valencia cf': 'Valencia',
  'real valladolid': 'Valladolid',
  'villarreal cf': 'Villarreal',
  'cd leganés': 'Leganés',

  // Serie A
  'atalanta bc': 'Atalanta',
  'bologna fc 1909': 'Bologna',
  'cagliari calcio': 'Cagliari',
  'como 1907': 'Como',
  'empoli fc': 'Empoli',
  'acf fiorentina': 'Fiorentina',
  'genoa cfc': 'Genoa',
  'fc internazionale milano': 'Inter Milan',
  'juventus fc': 'Juventus',
  'ss lazio': 'Lazio',
  'us lecce': 'Lecce',
  'ac milan': 'AC Milan',
  'ac monza': 'Monza',
  'ssc napoli': 'Napoli',
  'parma calcio 1913': 'Parma',
  'as roma': 'Roma',
  'torino fc': 'Torino',
  'udinese calcio': 'Udinese',
  'venezia fc': 'Venezia',
  'hellas verona fc': 'Verona'
};

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

    let validCount = 0;
    let invalidCount = 0;
    let unmatched = new Set<string>();

    for (const m of matches) {
      const t1Raw = m.team1.toLowerCase().trim();
      const t2Raw = m.team2.toLowerCase().trim();

      const mappedT1 = TEAM_ALIASES[t1Raw] || m.team1;
      const mappedT2 = TEAM_ALIASES[t2Raw] || m.team2;

      const dbT1 = leagueTeams.find(t => t.name.toLowerCase() === mappedT1.toLowerCase());
      const dbT2 = leagueTeams.find(t => t.name.toLowerCase() === mappedT2.toLowerCase());

      if (dbT1 && dbT2 && dbT1.id !== dbT2.id) {
        validCount++;
      } else {
        invalidCount++;
        if (!dbT1) unmatched.add(m.team1);
        if (!dbT2) unmatched.add(m.team2);
      }
    }

    console.log(`League: ${leagueSlug} | Found: ${matches.length} | Valid: ${validCount} | Invalid: ${invalidCount}`);
    if (unmatched.size > 0) {
      console.log(`  Unmatched openfootball teams:`, Array.from(unmatched));
    }
  }
}

testMapping().catch(console.error);
