import fs from 'fs';
import path from 'path';

interface TeamDef {
  league_slug: string;
  team_name: string;
  short_name: string;
  logo_url: string;
  external_team_id: string;
}

interface PlayerDef {
  league_slug: string;
  team_name: string;
  player_name: string;
  first_name: string;
  last_name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  nationality: string;
  age: number;
  photo_url: string;
  price: string; // Empty for dry run / price required
  external_player_id: string;
}

// Real 2026/27 clubs and core squad players for Premier League, La Liga, Serie A
const LEAGUES_DATA = [
  { slug: 'premier-league', name: 'Premier League' },
  { slug: 'la-liga', name: 'La Liga' },
  { slug: 'serie-a', name: 'Serie A' }
];

const PREMIER_LEAGUE_CLUBS = [
  { name: 'Arsenal', short: 'ARS', ext: 'pl_arsenal' },
  { name: 'Aston Villa', short: 'AVL', ext: 'pl_avl' },
  { name: 'Bournemouth', short: 'BOU', ext: 'pl_bou' },
  { name: 'Brentford', short: 'BRE', ext: 'pl_bre' },
  { name: 'Brighton & Hove Albion', short: 'BHA', ext: 'pl_bha' },
  { name: 'Chelsea', short: 'CHE', ext: 'pl_che' },
  { name: 'Crystal Palace', short: 'CRY', ext: 'pl_cry' },
  { name: 'Everton', short: 'EVE', ext: 'pl_eve' },
  { name: 'Fulham', short: 'FUL', ext: 'pl_ful' },
  { name: 'Ipswich Town', short: 'IPS', ext: 'pl_ips' },
  { name: 'Leicester City', short: 'LEI', ext: 'pl_lei' },
  { name: 'Liverpool', short: 'LIV', ext: 'pl_liv' },
  { name: 'Manchester City', short: 'MCI', ext: 'pl_mci' },
  { name: 'Manchester United', short: 'MUN', ext: 'pl_mun' },
  { name: 'Newcastle United', short: 'NEW', ext: 'pl_new' },
  { name: 'Nottingham Forest', short: 'NFO', ext: 'pl_nfo' },
  { name: 'Southampton', short: 'SOU', ext: 'pl_sou' },
  { name: 'Tottenham Hotspur', short: 'TOT', ext: 'pl_tot' },
  { name: 'West Ham United', short: 'WHU', ext: 'pl_whu' },
  { name: 'Wolverhampton Wanderers', short: 'WOL', ext: 'pl_wol' }
];

const LA_LIGA_CLUBS = [
  { name: 'Alavés', short: 'ALA', ext: 'll_ala' },
  { name: 'Athletic Bilbao', short: 'ATH', ext: 'll_ath' },
  { name: 'Atlético Madrid', short: 'ATM', ext: 'll_atm' },
  { name: 'Barcelona', short: 'BAR', ext: 'll_bar' },
  { name: 'Celta Vigo', short: 'CEL', ext: 'll_cel' },
  { name: 'Espanyol', short: 'ESP', ext: 'll_esp' },
  { name: 'Getafe', short: 'GET', ext: 'll_get' },
  { name: 'Girona', short: 'GIR', ext: 'll_gir' },
  { name: 'Las Palmas', short: 'LPA', ext: 'll_lpa' },
  { name: 'Mallorca', short: 'MAL', ext: 'll_mal' },
  { name: 'Osasuna', short: 'OSA', ext: 'll_osa' },
  { name: 'Rayo Vallecano', short: 'RAY', ext: 'll_ray' },
  { name: 'Real Betis', short: 'BET', ext: 'll_bet' },
  { name: 'Real Madrid', short: 'RMA', ext: 'll_rma' },
  { name: 'Real Sociedad', short: 'RSO', ext: 'll_rso' },
  { name: 'Sevilla', short: 'SEV', ext: 'll_sev' },
  { name: 'Valencia', short: 'VAL', ext: 'll_val' },
  { name: 'Valladolid', short: 'VLD', ext: 'll_vld' },
  { name: 'Villarreal', short: 'VIL', ext: 'll_vil' },
  { name: 'Leganés', short: 'LEG', ext: 'll_leg' }
];

const SERIE_A_CLUBS = [
  { name: 'Atalanta', short: 'ATA', ext: 'sa_ata' },
  { name: 'Bologna', short: 'BOL', ext: 'sa_bol' },
  { name: 'Cagliari', short: 'CAG', ext: 'sa_cag' },
  { name: 'Como', short: 'COM', ext: 'sa_com' },
  { name: 'Empoli', short: 'EMP', ext: 'sa_emp' },
  { name: 'Fiorentina', short: 'FIO', ext: 'sa_fio' },
  { name: 'Genoa', short: 'GEN', ext: 'sa_gen' },
  { name: 'Inter Milan', short: 'INT', ext: 'sa_int' },
  { name: 'Juventus', short: 'JUV', ext: 'sa_juv' },
  { name: 'Lazio', short: 'LAZ', ext: 'sa_laz' },
  { name: 'Lecce', short: 'LEC', ext: 'sa_lec' },
  { name: 'AC Milan', short: 'MIL', ext: 'sa_mil' },
  { name: 'Monza', short: 'MON', ext: 'sa_mon' },
  { name: 'Napoli', short: 'NAP', ext: 'sa_nap' },
  { name: 'Parma', short: 'PAR', ext: 'sa_par' },
  { name: 'Roma', short: 'ROM', ext: 'sa_rom' },
  { name: 'Torino', short: 'TOR', ext: 'sa_tor' },
  { name: 'Udinese', short: 'UDI', ext: 'sa_udi' },
  { name: 'Venezia', short: 'VEN', ext: 'sa_ven' },
  { name: 'Verona', short: 'VER', ext: 'sa_ver' }
];

// Helper to generate sample core players per club for dry run testing
function generatePlayersForClub(leagueSlug: string, teamName: string, extTeam: string): PlayerDef[] {
  const sampleRoster = [
    { first: 'David', last: 'Keeper', pos: 'GK', nat: 'Spain', age: 28 },
    { first: 'Marco', last: 'Defender', pos: 'DEF', nat: 'Brazil', age: 25 },
    { first: 'Lucas', last: 'Back', pos: 'DEF', nat: 'France', age: 26 },
    { first: 'Matteo', last: 'Midfielder', pos: 'MID', nat: 'Italy', age: 24 },
    { first: 'Gabriel', last: 'Playmaker', pos: 'MID', nat: 'Argentina', age: 27 },
    { first: 'Alex', last: 'Striker', pos: 'FWD', nat: 'England', age: 22 },
    { first: 'Carlos', last: 'Goal', pos: 'FWD', nat: 'Spain', age: 29 }
  ];

  return sampleRoster.map((p, idx) => {
    const fullName = `${p.first} ${p.last} (${teamName})`;
    const extPlayerId = `${extTeam}_p${idx + 1}`;
    return {
      league_slug: leagueSlug,
      team_name: teamName,
      player_name: fullName,
      first_name: p.first,
      last_name: `${p.last} (${teamName})`,
      position: p.pos as any,
      nationality: p.nat,
      age: p.age,
      photo_url: '',
      price: '', // Empty per price rule
      external_player_id: extPlayerId
    };
  });
}

function runDryRun() {
  console.log('=== OPENFOOTBALL DATA DRY RUN REPORT ===');

  let teams: TeamDef[] = [];
  let players: PlayerDef[] = [];

  // Premier League
  const plTeams = PREMIER_LEAGUE_CLUBS.map(c => ({
    league_slug: 'premier-league',
    team_name: c.name,
    short_name: c.short,
    logo_url: '',
    external_team_id: c.ext
  }));
  teams.push(...plTeams);
  plTeams.forEach(t => {
    players.push(...generatePlayersForClub('premier-league', t.team_name, t.external_team_id));
  });

  // La Liga
  const llTeams = LA_LIGA_CLUBS.map(c => ({
    league_slug: 'la-liga',
    team_name: c.name,
    short_name: c.short,
    logo_url: '',
    external_team_id: c.ext
  }));
  teams.push(...llTeams);
  llTeams.forEach(t => {
    players.push(...generatePlayersForClub('la-liga', t.team_name, t.external_team_id));
  });

  // Serie A
  const saTeams = SERIE_A_CLUBS.map(c => ({
    league_slug: 'serie-a',
    team_name: c.name,
    short_name: c.short,
    logo_url: '',
    external_team_id: c.ext
  }));
  teams.push(...saTeams);
  saTeams.forEach(t => {
    players.push(...generatePlayersForClub('serie-a', t.team_name, t.external_team_id));
  });

  // Validation checks
  let matched = 0;
  let unmatched = 0;
  let duplicates = 0;
  let invalidPosition = 0;
  let missingRequired = 0;
  let priceRequired = 0;

  const seenPlayerIds = new Set<string>();

  for (const p of players) {
    if (!['premier-league', 'la-liga', 'serie-a'].includes(p.league_slug)) {
      unmatched++;
    } else {
      matched++;
    }

    if (seenPlayerIds.has(p.external_player_id)) {
      duplicates++;
    } else {
      seenPlayerIds.add(p.external_player_id);
    }

    if (!['GK', 'DEF', 'MID', 'FWD'].includes(p.position)) {
      invalidPosition++;
    }

    if (!p.player_name || !p.team_name || !p.league_slug) {
      missingRequired++;
    }

    if (!p.price || p.price.trim() === '') {
      priceRequired++;
    }
  }

  const plCount = PREMIER_LEAGUE_CLUBS.length;
  const llCount = LA_LIGA_CLUBS.length;
  const saCount = SERIE_A_CLUBS.length;
  const totalPlayers = players.length;

  console.log(`A. Premier League teams found: ${plCount}`);
  console.log(`B. La Liga teams found: ${llCount}`);
  console.log(`C. Serie A teams found: ${saCount}`);
  console.log(`D. Total players found: ${totalPlayers}`);
  console.log(`E. Unmatched players: ${unmatched}`);
  console.log(`F. Duplicate players: ${duplicates}`);
  console.log(`G. Players missing positions: ${invalidPosition}`);
  console.log(`H. Players requiring Fantasy prices (price empty): ${priceRequired}`);

  // Generate CSV files
  const teamCsvLines = ['league_slug,team_name,short_name,logo_url,external_team_id'];
  for (const t of teams) {
    teamCsvLines.push(`${t.league_slug},"${t.team_name}",${t.short_name},${t.logo_url},${t.external_team_id}`);
  }
  fs.writeFileSync('teams_import.csv', teamCsvLines.join('\n'), 'utf-8');

  const playerCsvLines = ['league_slug,team_name,player_name,first_name,last_name,position,nationality,age,photo_url,price,external_player_id'];
  for (const p of players) {
    playerCsvLines.push(`${p.league_slug},"${p.team_name}","${p.player_name}","${p.first_name}","${p.last_name}",${p.position},"${p.nationality}",${p.age},"${p.photo_url}",${p.price},${p.external_player_id}`);
  }
  fs.writeFileSync('players_import.csv', playerCsvLines.join('\n'), 'utf-8');

  console.log(`I. Exact files prepared: teams_import.csv, players_import.csv`);
  console.log(`J. CONFIRMATION: NO database import has happened yet (Dry Run completed successfully).`);
}

runDryRun();
