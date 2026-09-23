import fs from 'fs';
import path from 'path';

function generateStatsCsvTemplate() {
  const headers = [
    'fixture_external_id',
    'player_external_id',
    'league_id',
    'minutes',
    'goals',
    'assists',
    'clean_sheet',
    'yellow_cards',
    'red_cards',
    'penalty_saved',
    'penalty_missed',
    'own_goals',
    'saves',
    'bonus'
  ];

  // Sample row representing structure for real match data import
  const sampleRow = [
    'pl_fix_2026_01',
    'pl_arsenal_p1',
    'premier-league',
    '90',
    '0',
    '1',
    'true',
    '0',
    '0',
    '0',
    '0',
    '0',
    '3',
    '2'
  ];

  const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
  const filePath = path.join(process.cwd(), 'stats_import_template.csv');
  fs.writeFileSync(filePath, csvContent, 'utf-8');
  console.log(`Successfully generated stats import template at ${filePath}`);
}

generateStatsCsvTemplate();
