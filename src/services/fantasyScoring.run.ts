import {
  calculatePlayerMatchPoints,
  validateSquad,
  validateCaptains,
  calculateSquadTotalPoints
} from './fantasyScoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log('Running Abay Games Fantasy Engine Test Suite...');

// 1. Scoring rules tests
const fwdPts = calculatePlayerMatchPoints({
  position: 'FWD',
  minutes: 90,
  goals: 1,
  assists: 1,
  clean_sheet: false,
  yellow_cards: 1,
  red_cards: 0,
  penalty_saved: 0,
  penalty_missed: 0,
  own_goals: 0,
  saves: 0,
  bonus: 0
});
assert(fwdPts === 8, 'FWD scoring calculation (Goal 4 + Assist 3 + 60m 2 - YC 1 = 8)');

const gkPts = calculatePlayerMatchPoints({
  position: 'GK',
  minutes: 90,
  goals: 0,
  assists: 0,
  clean_sheet: true,
  yellow_cards: 0,
  red_cards: 0,
  penalty_saved: 1,
  penalty_missed: 0,
  own_goals: 0,
  saves: 6,
  bonus: 0
});
assert(gkPts === 13, 'GK scoring calculation (Clean sheet 4 + 60m 2 + saves 2 + pen save 5 = 13)');

const redCardPts = calculatePlayerMatchPoints({
  position: 'MID',
  minutes: 45,
  goals: 1,
  assists: 0,
  clean_sheet: false,
  yellow_cards: 0,
  red_cards: 1,
  penalty_saved: 0,
  penalty_missed: 0,
  own_goals: 0,
  saves: 0,
  bonus: 0
});
assert(redCardPts === 3, 'Red card points retention (Appearance 1 + Goal 5 - Red card 3 = 3)');

// 2. Squad and budget validation tests
const validSquad = [
  { id: '1', position: 'GK' as const, price: 5.0, points: 10 },
  { id: '2', position: 'DEF' as const, price: 6.0, points: 10 },
  { id: '3', position: 'DEF' as const, price: 6.0, points: 10 },
  { id: '4', position: 'DEF' as const, price: 6.0, points: 10 },
  { id: '5', position: 'DEF' as const, price: 6.0, points: 10 },
  { id: '6', position: 'MID' as const, price: 8.0, points: 10 },
  { id: '7', position: 'MID' as const, price: 8.0, points: 10 },
  { id: '8', position: 'MID' as const, price: 8.0, points: 10 },
  { id: '9', position: 'MID' as const, price: 8.0, points: 10 },
  { id: '10', position: 'FWD' as const, price: 10.0, points: 10 },
  { id: '11', position: 'FWD' as const, price: 10.0, points: 10 },
];

const squadRes = validateSquad(validSquad, 100.0);
assert(squadRes.isValid === true, 'Valid 11-player squad (1 GK, 4 DEF, 4 MID, 2 FWD, <=100M)');

const expensiveSquad = validSquad.map((p, idx) => idx === 0 ? { ...p, price: 50.0 } : p);
const expRes = validateSquad(expensiveSquad, 100.0);
assert(expRes.isValid === false, 'Budget validation blocks squads exceeding 100M');

const duplicateSquad = [...validSquad.slice(0, 10), validSquad[0]];
const dupRes = validateSquad(duplicateSquad, 100.0);
assert(dupRes.isValid === false, 'Duplicate player prevention works');

// 3. Captain / VC validation tests
const squadIds = ['1', '2', '3'];
assert(validateCaptains('1', '2', squadIds).isValid === true, 'Valid captain and vice-captain selection');
assert(validateCaptains('1', '1', squadIds).isValid === false, 'Blocks same player as captain and vice-captain');
assert(validateCaptains('1', '99', squadIds).isValid === false, 'Blocks captain/VC outside squad');

// 4. Captain x2 & VC fallback tests
const squadPointsTest = [
  { id: 'c', points: 10, minutesPlayed: 0 }, // Did not play
  { id: 'vc', points: 8, minutesPlayed: 90 }, // Played
  { id: 'p3', points: 5, minutesPlayed: 90 },
];
const ptResult = calculateSquadTotalPoints(squadPointsTest, 'c', 'vc');
assert(ptResult.breakdown['vc'] === 16, 'Vice-captain fallback activates when captain plays 0 minutes (8 * 2 = 16)');

console.log('All Abay Games Fantasy Engine tests passed successfully!');
