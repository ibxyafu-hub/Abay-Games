import dotenv from 'dotenv';
dotenv.config();

async function run() {
  // First get a league and two teams
  const res = await fetch('http://localhost:3000/api/admin/fantasy/leagues', {
    headers: { 'x-telegram-id': '123456789' }
  });
  const lData = await res.json();
  console.log('Leagues:', lData);
  if (!lData.leagues || lData.leagues.length === 0) return;

  const league = lData.leagues[0];
  const tRes = await fetch(`http://localhost:3000/api/admin/fantasy/teams?league_id=${league.id}`, {
    headers: { 'x-telegram-id': '123456789' }
  });
  const tData = await tRes.json();
  console.log('Teams:', tData);
  if (!tData.teams || tData.teams.length < 2) return;

  const home = tData.teams[0];
  const away = tData.teams[1];

  console.log('Creating fixture via API...');
  const fixRes = await fetch('http://localhost:3000/api/admin/fantasy/fixtures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({
      league_id: league.id,
      home_team_id: home.id,
      away_team_id: away.id,
      kickoff_at: new Date().toISOString(),
      status: 'scheduled'
    })
  });
  const fixData = await fixRes.json();
  console.log('Fixture create response:', fixData);
}

run().catch(console.error);
