import fs from 'fs';

async function run() {
  const teamCsv = fs.readFileSync('teams_import.csv', 'utf-8');
  const res = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'teams', csvData: teamCsv, dryRun: true })
  });
  const json = await res.json();
  console.log('Dry run response:', JSON.stringify(json, null, 2));
}

run().catch(console.error);
