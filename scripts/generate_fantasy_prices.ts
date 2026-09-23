import fs from 'fs';

interface PlayerRow {
  league_slug: string;
  team_name: string;
  player_name: string;
  first_name: string;
  last_name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  nationality: string;
  age: number;
  photo_url: string;
  price: string;
  external_player_id: string;
}

const TIER_1_CLUBS = new Set([
  'Manchester City', 'Arsenal', 'Liverpool', 'Real Madrid', 'Barcelona', 'Atlético Madrid', 'Inter Milan', 'Juventus', 'AC Milan', 'Napoli'
]);
const TIER_2_CLUBS = new Set([
  'Manchester United', 'Tottenham Hotspur', 'Chelsea', 'Aston Villa', 'Newcastle United', 'Athletic Bilbao', 'Real Sociedad', 'Villarreal', 'Roma', 'Atalanta', 'Lazio', 'Fiorentina', 'Bologna'
]);

function getClubTier(teamName: string): number {
  if (TIER_1_CLUBS.has(teamName)) return 1;
  if (TIER_2_CLUBS.has(teamName)) return 2;
  return 3;
}

function calculateDeterministicPrice(position: string, teamName: string, index: number): number {
  const tier = getClubTier(teamName);
  let baseMin = 4.0;

  if (position === 'GK') {
    baseMin = 3.5;
  } else if (position === 'DEF') {
    baseMin = 4.0;
  } else if (position === 'MID') {
    baseMin = 4.5;
  } else if (position === 'FWD') {
    baseMin = 5.0;
  }

  let tierBonus = 0;
  if (tier === 1) tierBonus = 2.5;
  else if (tier === 2) tierBonus = 1.2;

  const hashVar = ((index * 37) % 15) * 0.1;

  let price = baseMin + tierBonus + hashVar;

  if (position === 'GK') {
    price = Math.max(3.5, Math.min(6.5, price));
  } else if (position === 'DEF') {
    price = Math.max(3.5, Math.min(8.0, price));
  } else if (position === 'MID') {
    price = Math.max(4.0, Math.min(12.5, price));
  } else if (position === 'FWD') {
    price = Math.max(4.5, Math.min(14.5, price));
  }

  return Number(price.toFixed(1));
}

function runPricingAndSimulation() {
  console.log('=== ABAY GAMES FANTASY PRICING & SIMULATION REPORT ===');

  const PREMIER_LEAGUE_CLUBS = ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'];
  const LA_LIGA_CLUBS = ['Alavés', 'Athletic Bilbao', 'Atlético Madrid', 'Barcelona', 'Celta Vigo', 'Espanyol', 'Getafe', 'Girona', 'Las Palmas', 'Mallorca', 'Osasuna', 'Rayo Vallecano', 'Real Betis', 'Real Madrid', 'Real Sociedad', 'Sevilla', 'Valencia', 'Valladolid', 'Villarreal', 'Leganés'];
  const SERIE_A_CLUBS = ['Atalanta', 'Bologna', 'Cagliari', 'Como', 'Empoli', 'Fiorentina', 'Genoa', 'Inter Milan', 'Juventus', 'Lazio', 'Lecce', 'AC Milan', 'Monza', 'Napoli', 'Parma', 'Roma', 'Torino', 'Udinese', 'Venezia', 'Verona'];

  const allPlayers: PlayerRow[] = [];
  let globalIdx = 0;

  const addLeagueClubs = (leagueSlug: string, clubs: string[], prefix: string) => {
    clubs.forEach((club, cIdx) => {
      const extTeam = `${prefix}_${cIdx + 1}`;
      const roster = [
        { first: 'David', last: 'Keeper', pos: 'GK', nat: 'Spain', age: 28 },
        { first: 'Marco', last: 'Defender', pos: 'DEF', nat: 'Brazil', age: 25 },
        { first: 'Lucas', last: 'Back', pos: 'DEF', nat: 'France', age: 26 },
        { first: 'Matteo', last: 'Midfielder', pos: 'MID', nat: 'Italy', age: 24 },
        { first: 'Gabriel', last: 'Playmaker', pos: 'MID', nat: 'Argentina', age: 27 },
        { first: 'Alex', last: 'Striker', pos: 'FWD', nat: 'England', age: 22 },
        { first: 'Carlos', last: 'Goal', pos: 'FWD', nat: 'Spain', age: 29 }
      ];

      roster.forEach((p, pIdx) => {
        globalIdx++;
        const fullName = `${p.first} ${p.last} (${club})`;
        const extPlayerId = `${extTeam}_p${pIdx + 1}`;
        const priceNum = calculateDeterministicPrice(p.pos, club, globalIdx);

        allPlayers.push({
          league_slug: leagueSlug,
          team_name: club,
          player_name: fullName,
          first_name: p.first,
          last_name: `${p.last} (${club})`,
          position: p.pos as any,
          nationality: p.nat,
          age: p.age,
          photo_url: '',
          price: priceNum.toFixed(1),
          external_player_id: extPlayerId
        });
      });
    });
  };

  addLeagueClubs('premier-league', PREMIER_LEAGUE_CLUBS, 'pl');
  addLeagueClubs('la-liga', LA_LIGA_CLUBS, 'll');
  addLeagueClubs('serie-a', SERIE_A_CLUBS, 'sa');

  const totalPlayers = allPlayers.length;
  const byPos: Record<string, PlayerRow[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  allPlayers.forEach(p => byPos[p.position].push(p));

  const prices = allPlayers.map(p => parseFloat(p.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Number((prices.reduce((a, b) => a + b, 0) / totalPlayers).toFixed(2));

  const tiers: Record<string, number> = {
    '3.5 - 5.0M': 0,
    '5.1 - 7.0M': 0,
    '7.1 - 9.0M': 0,
    '9.1 - 12.0M': 0,
    '12.1M+': 0
  };

  prices.forEach(pr => {
    if (pr <= 5.0) tiers['3.5 - 5.0M']++;
    else if (pr <= 7.0) tiers['5.1 - 7.0M']++;
    else if (pr <= 9.0) tiers['7.1 - 9.0M']++;
    else if (pr <= 12.0) tiers['9.1 - 12.0M']++;
    else tiers['12.1M+']++;
  });

  console.log(`\nA. PRICING METHODOLOGY: Deterministic formula combining Position base ranges, Club Tier prestige, and stable pseudo-random hashing index.`);
  console.log(`B. PRICE DISTRIBUTION: Total ${totalPlayers} players. Min: ${minPrice}M, Max: ${maxPrice}M, Avg: ${avgPrice}M`);

  // Budget sanity check
  const formations = [
    { name: '4-3-3', gk: 1, def: 4, mid: 3, fwd: 3 },
    { name: '4-4-2', gk: 1, def: 4, mid: 4, fwd: 2 },
    { name: '3-4-3', gk: 1, def: 3, mid: 4, fwd: 3 },
    { name: '3-5-2', gk: 1, def: 3, mid: 5, fwd: 2 },
    { name: '4-5-1', gk: 1, def: 4, mid: 5, fwd: 1 },
    { name: '5-3-2', gk: 1, def: 5, mid: 3, fwd: 2 }
  ];

  console.log(`\nC. BUDGET SANITY CHECK (100.0M Limit):`);
  const sortedGk = [...byPos.GK].sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
  const sortedDef = [...byPos.DEF].sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
  const sortedMid = [...byPos.MID].sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
  const sortedFwd = [...byPos.FWD].sort((a,b) => parseFloat(a.price) - parseFloat(b.price));

  formations.forEach(f => {
    const selectedGk = sortedGk[0];
    const selectedDefs = sortedDef.slice(0, f.def);
    const selectedMids = sortedMid.slice(0, f.mid);
    const selectedFwds = sortedFwd.slice(0, f.fwd);

    const totalCost = parseFloat(selectedGk.price) +
      selectedDefs.reduce((acc, p) => acc + parseFloat(p.price), 0) +
      selectedMids.reduce((acc, p) => acc + parseFloat(p.price), 0) +
      selectedFwds.reduce((acc, p) => acc + parseFloat(p.price), 0);

    const valid = totalCost <= 100.0;
    console.log(`- Formation ${f.name}: Squad Total Cost = ${totalCost.toFixed(1)}M (${valid ? 'PASS' : 'FAIL'})`);
  });

  // Write players_import.csv
  const playerCsvLines = ['league_slug,team_name,player_name,first_name,last_name,position,nationality,age,photo_url,price,external_player_id'];
  for (const p of allPlayers) {
    playerCsvLines.push(`${p.league_slug},"${p.team_name}","${p.player_name}","${p.first_name}","${p.last_name}",${p.position},"${p.nationality}",${p.age},"${p.photo_url}",${p.price},${p.external_player_id}`);
  }
  fs.writeFileSync('players_import.csv', playerCsvLines.join('\n'), 'utf-8');

  console.log(`\nD. Confirm players_import.csv is ready: YES`);
  console.log(`E. Confirm Supabase was NOT modified: YES (No network requests or database mutations performed).`);
}

runPricingAndSimulation();
