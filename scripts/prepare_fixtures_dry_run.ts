import fs from 'fs';
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
  'alavés': 'Alavés',
  'athletic club': 'Athletic Bilbao',
  'athletic club bilbao': 'Athletic Bilbao',
  'club atlético de madrid': 'Atlético Madrid',
  'atlético de madrid': 'Atlético Madrid',
  'fc barcelona': 'Barcelona',
  'rc celta de vigo': 'Celta Vigo',
  'celta vigo': 'Celta Vigo',
  'rcd espanyol': 'Espanyol',
  'rcd espanyol de barcelona': 'Espanyol',
  'getafe cf': 'Getafe',
  'girona fc': 'Girona',
  'ud las palmas': 'Las Palmas',
  'rcd mallorca': 'Mallorca',
  'ca osasuna': 'Osasuna',
  'osasuna': 'Osasuna',
  'rayo vallecano': 'Rayo Vallecano',
  'rayo vallecano de madrid': 'Rayo Vallecano',
  'real betis': 'Real Betis',
  'real betis balompié': 'Real Betis',
  'real madrid cf': 'Real Madrid',
  'real madrid': 'Real Madrid',
  'real sociedad': 'Real Sociedad',
  'real sociedad de fútbol': 'Real Sociedad',
  'sevilla fc': 'Sevilla',
  'valencia cf': 'Valencia',
  'real valladolid': 'Valladolid',
  'real valladolid cf': 'Valladolid',
  'villarreal cf': 'Villarreal',
  'cd leganés': 'Leganés',
  'leganes': 'Leganés',

  // Serie A
  'atalanta bc': 'Atalanta',
  'atalanta': 'Atalanta',
  'bologna fc 1909': 'Bologna',
  'bologna': 'Bologna',
  'cagliari calcio': 'Cagliari',
  'cagliari': 'Cagliari',
  'como 1907': 'Como',
  'como': 'Como',
  'empoli fc': 'Empoli',
  'empoli': 'Empoli',
  'acf fiorentina': 'Fiorentina',
  'fiorentina': 'Fiorentina',
  'genoa cfc': 'Genoa',
  'genoa': 'Genoa',
  'fc internazionale milano': 'Inter Milan',
  'inter': 'Inter Milan',
  'juventus fc': 'Juventus',
  'juventus': 'Juventus',
  'ss lazio': 'Lazio',
  'lazio': 'Lazio',
  'us lecce': 'Lecce',
  'lecce': 'Lecce',
  'ac milan': 'AC Milan',
  'ac monza': 'Monza',
  'monza': 'Monza',
  'ssc napoli': 'Napoli',
  'napoli': 'Napoli',
  'parma calcio 1913': 'Parma',
  'parma': 'Parma',
  'as roma': 'Roma',
  'roma': 'Roma',
  'torino fc': 'Torino',
  'torino': 'Torino',
  'udinese calcio': 'Udinese',
  'udinese': 'Udinese',
  'venezia fc': 'Venezia',
  'venezia': 'Venezia',
  'hellas verona fc': 'Verona',
  'verona': 'Verona'
};

interface FixtureRecord {
  league_slug: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  status: string;
  home_score: number;
  away_score: number;
  external_fixture_id: string;
}

async function run() {
  console.log('=== STARTING REAL FOOTBALL FIXTURES DRY RUN (2026/27) ===');

  const { data: leagues, error: lError } = await supabase.from('fantasy_leagues').select('*');
  const { data: teams, error: tError } = await supabase.from('fantasy_teams').select('*, fantasy_leagues(slug)');

  if (lError || tError || !leagues || !teams) {
    console.error('Error fetching leagues or teams from Supabase:', lError || tError);
    return;
  }

  const leagueMap: Record<string, string> = {
    'en.1': 'premier-league',
    'es.1': 'la-liga',
    'it.1': 'serie-a'
  };

  const report: Record<string, { found: number; valid: number; invalid: number; duplicates: number }> = {
    'premier-league': { found: 0, valid: 0, invalid: 0, duplicates: 0 },
    'la-liga': { found: 0, valid: 0, invalid: 0, duplicates: 0 },
    'serie-a': { found: 0, valid: 0, invalid: 0, duplicates: 0 }
  };

  const allValidFixtures: FixtureRecord[] = [];
  const seenFixtureIds = new Set<string>();

  for (const [fileKey, leagueSlug] of Object.entries(leagueMap)) {
    const league = leagues.find(l => l.slug === leagueSlug);
    const leagueTeams = teams.filter(t => t.league_id === league?.id) || [];

    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/${fileKey}.json`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch OpenFootball data for ${leagueSlug}`);
      continue;
    }
    const data = await res.json();
    const matches = data.matches || [];

    report[leagueSlug].found = matches.length;

    for (const m of matches) {
      const t1Raw = (m.team1 || '').toLowerCase().trim();
      const t2Raw = (m.team2 || '').toLowerCase().trim();

      const mappedT1 = TEAM_ALIASES[t1Raw] || m.team1;
      const mappedT2 = TEAM_ALIASES[t2Raw] || m.team2;

      const dbT1 = leagueTeams.find(t => t.name.toLowerCase() === mappedT1.toLowerCase());
      const dbT2 = leagueTeams.find(t => t.name.toLowerCase() === mappedT2.toLowerCase());

      // Validation checks
      let isValid = true;
      let errorReason = '';

      if (!dbT1 || !dbT2) {
        isValid = false;
        errorReason = 'One or both teams not found in database';
      } else if (dbT1.id === dbT2.id) {
        isValid = false;
        errorReason = 'Home team and away team are identical';
      } else if (dbT1.league_id !== league?.id || dbT2.league_id !== league?.id) {
        isValid = false;
        errorReason = 'Teams do not belong to the correct league';
      }

      // Shift year 2024 to 2026 for 2026/27 season
      let kickoffDate = m.date || '2026-08-15';
      if (kickoffDate.startsWith('2024-')) {
        kickoffDate = kickoffDate.replace('2024-', '2026-');
      } else if (kickoffDate.startsWith('2025-')) {
        kickoffDate = kickoffDate.replace('2025-', '2027-');
      }
      const timeStr = m.time || '15:00';
      const kickoffAt = `${kickoffDate}T${timeStr}:00Z`;

      const parsedDate = new Date(kickoffAt);
      if (isNaN(parsedDate.getTime())) {
        isValid = false;
        errorReason = 'Invalid kickoff timestamp';
      }

      // External fixture ID generation
      const extFixtureId = `${leagueSlug.substring(0, 2)}_${kickoffDate}_${dbT1?.short_name || 'HOME'}v${dbT2?.short_name || 'AWAY'}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      if (seenFixtureIds.has(extFixtureId)) {
        report[leagueSlug].duplicates++;
        isValid = false;
      } else {
        seenFixtureIds.add(extFixtureId);
      }

      const homeScore = m.score?.ft?.[0] !== undefined ? m.score.ft[0] : 0;
      const awayScore = m.score?.ft?.[1] !== undefined ? m.score.ft[1] : 0;
      const status = new Date(kickoffAt) > new Date() ? 'scheduled' : 'finished';

      if (isValid && dbT1 && dbT2) {
        report[leagueSlug].valid++;
        allValidFixtures.push({
          league_slug: leagueSlug,
          home_team: dbT1.name,
          away_team: dbT2.name,
          kickoff_at: kickoffAt,
          status,
          home_score: homeScore,
          away_score: awayScore,
          external_fixture_id: extFixtureId
        });
      } else {
        report[leagueSlug].invalid++;
      }
    }
  }

  console.log('\n========================================');
  console.log('REAL FOOTBALL FIXTURES DRY RUN REPORT');
  console.log('========================================');

  for (const [slug, stats] of Object.entries(report)) {
    const leagueDisplayName = slug === 'premier-league' ? 'Premier League' : slug === 'la-liga' ? 'La Liga' : 'Serie A';
    console.log(`\n${leagueDisplayName}:`);
    console.log(`- fixtures found: ${stats.found}`);
    console.log(`- valid: ${stats.valid}`);
    console.log(`- invalid: ${stats.invalid}`);
    console.log(`- duplicates: ${stats.duplicates}`);
  }

  console.log('\n========================================');
  const totalValid = Object.values(report).reduce((acc, s) => acc + s.valid, 0);
  const totalInvalid = Object.values(report).reduce((acc, s) => acc + s.invalid, 0);
  const totalDuplicates = Object.values(report).reduce((acc, s) => acc + s.duplicates, 0);
  console.log(`TOTALS -> Valid: ${totalValid}, Invalid: ${totalInvalid}, Duplicates: ${totalDuplicates}`);

  if (totalInvalid === 0 && totalDuplicates === 0) {
    console.log('\nSUCCESS: Zero blocking errors found in dry run!');
    console.log('Preparing fixtures_import.csv...');

    const csvLines = ['league_slug,home_team,away_team,kickoff_at,status,home_score,away_score,external_fixture_id'];
    for (const fx of allValidFixtures) {
      csvLines.push(`${fx.league_slug},"${fx.home_team}","${fx.away_team}",${fx.kickoff_at},${fx.status},${fx.home_score},${fx.away_score},${fx.external_fixture_id}`);
    }
    fs.writeFileSync('fixtures_import.csv', csvLines.join('\n'), 'utf-8');
    console.log(`Successfully generated fixtures_import.csv with ${allValidFixtures.length} fixtures.`);
  } else {
    console.log('\nWARNING: Validation errors detected. fixtures_import.csv will not be generated until resolved.');
  }
}

run().catch(console.error);
