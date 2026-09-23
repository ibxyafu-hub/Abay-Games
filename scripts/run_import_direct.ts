import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function hashStringToBigInt(str: string): number {
  if (!str) return Math.floor(Math.random() * 1000000) + 1;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) + 1;
}

async function run() {
  console.log('Starting full database cleanup of test records...');
  await supabase.from('fantasy_players').delete().ilike('name', '%test%');
  await supabase.from('fantasy_teams').delete().ilike('name', '%test%');

  console.log('Supabase connected:', !!supabase);

  // 1. Import Teams
  const teamCsv = fs.readFileSync('teams_import.csv', 'utf-8');
  const teamLines = teamCsv.trim().split('\n');
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*');

  let teamsCreated = 0;
  for (let i = 1; i < teamLines.length; i++) {
    const vals = teamLines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const league_slug = vals[0];
    const team_name = vals[1];
    const short_name = vals[2] || team_name.substring(0, 3).toUpperCase();
    const logo_url = vals[3] || '';
    const ext_str = vals[4] || team_name;
    const external_team_id = hashStringToBigInt(ext_str);

    const leagueMatch = leagues?.find(l => l.slug === league_slug);
    if (!leagueMatch) continue;

    const { data: existing } = await supabase.from('fantasy_teams').select('*').eq('external_team_id', external_team_id).maybeSingle();
    if (existing) {
      await supabase.from('fantasy_teams').update({ name: team_name, short_name, logo_url }).eq('id', existing.id);
    } else {
      const { error } = await supabase.from('fantasy_teams').insert({
        league_id: leagueMatch.id,
        name: team_name,
        short_name,
        logo_url,
        external_team_id
      });
      if (error) console.error('Team insert error:', error);
      else teamsCreated++;
    }
  }
  console.log(`Teams imported successfully: ${teamsCreated}`);

  // 2. Import Players
  const playerCsv = fs.readFileSync('players_import.csv', 'utf-8');
  const playerLines = playerCsv.trim().split('\n');
  const { data: teams } = await supabase.from('fantasy_teams').select('*');

  let playersCreated = 0;
  for (let i = 1; i < playerLines.length; i++) {
    const vals = playerLines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const league_slug = vals[0];
    const team_name = vals[1];
    const player_name = vals[2];
    const position = (vals[5] || '').toUpperCase();
    const nationality = vals[6] || '';
    const age = vals[7] ? parseInt(vals[7], 10) : 24;
    const photo_url = vals[8] || '';
    const price = vals[9] ? parseFloat(vals[9]) : 5.0;
    const ext_p_str = vals[10] || `${team_name}_${player_name}`;
    const external_player_id = hashStringToBigInt(ext_p_str);

    const leagueMatch = leagues?.find(l => l.slug === league_slug);
    if (!leagueMatch) continue;
    const teamMatch = teams?.find(t => t.league_id === leagueMatch.id && t.name.toLowerCase() === team_name.toLowerCase());
    if (!teamMatch) continue;

    const { data: existingP } = await supabase.from('fantasy_players').select('*').eq('external_player_id', external_player_id).maybeSingle();
    if (existingP) {
      const { error } = await supabase.from('fantasy_players').update({ team_id: teamMatch.id, position, price, nationality, age, photo_url }).eq('id', existingP.id);
      if (error) console.error('Player update error:', error);
    } else {
      const { error } = await supabase.from('fantasy_players').insert({
        team_id: teamMatch.id,
        name: player_name,
        position,
        nationality,
        age,
        photo_url,
        price,
        external_player_id
      });
      if (error) {
        console.error('Player insert error:', error);
      } else {
        playersCreated++;
      }
    }
  }
  console.log(`Players imported successfully: ${playersCreated}`);

  const { count: teamCount } = await supabase.from('fantasy_teams').select('*', { count: 'exact', head: true });
  const { count: playerCount } = await supabase.from('fantasy_players').select('*', { count: 'exact', head: true });
  console.log(`FINAL DB COUNTS -> Teams: ${teamCount} (Expected: 60), Players: ${playerCount} (Expected: 420)`);
}

run().catch(console.error);
