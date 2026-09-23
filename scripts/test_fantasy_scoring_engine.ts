import { calculatePlayerMatchPoints, calculateSquadTotalPoints, validateSquad, validateCaptains } from '../src/services/fantasyScoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log('=== STARTING FANTASY SCORING & VALIDATION DRY-RUN SUITE (IN MEMORY ONLY) ===');

// 1. SCORING SCENARIOS VERIFICATION
// -------------------------------------------------------------------------

// Scenario A: Goalkeeper (GK) with Clean Sheet, Saves, Penalty Saved
const gkStats = {
  position: 'GK' as const,
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
  bonus: 2
};
const gkPts = calculatePlayerMatchPoints(gkStats);
// Breakdown: Appearance (60+ mins) = 2, Clean Sheet = 4, Saves (6/3) = 2, Penalty Saved = 5, Bonus = 2 -> Total = 15
assert(gkPts === 15, `GK Scoring: Expected 15 pts, got ${gkPts}`);

// Scenario B: Defender (DEF) with Clean Sheet and Assist
const defStats = {
  position: 'DEF' as const,
  minutes: 90,
  goals: 0,
  assists: 1,
  clean_sheet: true,
  yellow_cards: 1,
  red_cards: 0,
  penalty_saved: 0,
  penalty_missed: 0,
  own_goals: 0,
  saves: 0,
  bonus: 1
};
const defPts = calculatePlayerMatchPoints(defStats);
// Breakdown: Appearance = 2, Assist = 3, Clean Sheet = 4, Yellow Card = -1, Bonus = 1 -> Total = 9
assert(defPts === 9, `DEF Scoring: Expected 9 pts, got ${defPts}`);

// Scenario C: Midfielder (MID) with Goal, Clean Sheet, Yellow Card
const midStats = {
  position: 'MID' as const,
  minutes: 90,
  goals: 1,
  assists: 0,
  clean_sheet: true,
  yellow_cards: 1,
  red_cards: 0,
  penalty_saved: 0,
  penalty_missed: 0,
  own_goals: 0,
  saves: 0,
  bonus: 3
};
const midPts = calculatePlayerMatchPoints(midStats);
// Breakdown: Appearance = 2, Goal (MID) = 5, Clean Sheet = 1, Yellow Card = -1, Bonus = 3 -> Total = 10
assert(midPts === 10, `MID Scoring: Expected 10 pts, got ${midPts}`);

// Scenario D: Forward (FWD) with Goal and Assist
const fwdStats = {
  position: 'FWD' as const,
  minutes: 80,
  goals: 2,
  assists: 1,
  clean_sheet: false,
  yellow_cards: 0,
  red_cards: 0,
  penalty_saved: 0,
  penalty_missed: 1,
  own_goals: 0,
  saves: 0,
  bonus: 0
};
const fwdPts = calculatePlayerMatchPoints(fwdStats);
// Breakdown: Appearance = 2, Goals (2 * 4 = 8), Assist = 3, Penalty Missed = -2 -> Total = 11
assert(fwdPts === 11, `FWD Scoring: Expected 11 pts, got ${fwdPts}`);

// Scenario E: Red Card and Penalty Miss / Own Goal negative validation
const penalisedStats = {
  position: 'MID' as const,
  minutes: 30,
  goals: 0,
  assists: 0,
  clean_sheet: false,
  yellow_cards: 2,
  red_cards: 1,
  penalty_saved: 0,
  penalty_missed: 1,
  own_goals: 1,
  saves: 0,
  bonus: 0
};
const penalisedPts = calculatePlayerMatchPoints(penalisedStats);
// Breakdown: Appearance (<60m) = 1, Yellow cards (-2), Red card (-3), Penalty missed (-2), Own goal (-2) -> Total = -8
assert(penalisedPts === -8, `Penalised Player Scoring: Expected -8 pts, got ${penalisedPts}`);


// 2. CAPTAIN & VICE-CAPTAIN MULTIPLIER RULES
// -------------------------------------------------------------------------
const squadForTest = [
  { id: 'p_captain', points: 10, minutesPlayed: 0 }, // Captain did not play (0 mins)
  { id: 'p_vc', points: 8, minutesPlayed: 90 },       // Vice Captain played
  { id: 'p_other', points: 6, minutesPlayed: 90 }
];

const totalResult = calculateSquadTotalPoints(squadForTest, 'p_captain', 'p_vc');
// Since captain minutesPlayed = 0, VC should receive 2x multiplier
// Breakdown: captain (10 * 1 = 10), vc (8 * 2 = 16), other (6) -> Total = 32
assert(totalResult.breakdown['p_vc'] === 16, `VC Multiplier Fallback: Expected VC points to double to 16, got ${totalResult.breakdown['p_vc']}`);
assert(totalResult.totalPoints === 32, `Total Squad Points with VC Fallback: Expected 32, got ${totalResult.totalPoints}`);


// 3. SERVER-SIDE VALIDATION RULES (IN-MEMORY SIMULATION)
// -------------------------------------------------------------------------
interface PlayerMatchRecord {
  fixture_id: string;
  player_id: string;
  league_id: string;
  minutes: number;
  goals: number;
  assists: number;
  clean_sheet: boolean;
  yellow_cards: number;
  red_cards: number;
  penalty_saved: number;
  penalty_missed: number;
  own_goals: number;
  saves: number;
  bonus: number;
}

function validatePlayerMatchStatsInput(
  input: PlayerMatchRecord,
  mockPlayers: Array<{ id: string; leagueId: string }>,
  mockFixtures: Array<{ id: string; league_id: string }>,
  existingStats: Array<{ fixture_id: string; player_id: string }>
): { isValid: boolean; error?: string } {
  // 1. Nonexistent player check
  const player = mockPlayers.find(p => p.id === input.player_id);
  if (!player) {
    return { isValid: false, error: `Validation Error: Player ID ${input.player_id} does not exist.` };
  }

  // 2. Nonexistent fixture check
  const fixture = mockFixtures.find(f => f.id === input.fixture_id);
  if (!fixture) {
    return { isValid: false, error: `Validation Error: Fixture ID ${input.fixture_id} does not exist.` };
  }

  // 3. Player league membership check
  if (player.leagueId && fixture.league_id && player.leagueId !== fixture.league_id) {
    return { isValid: false, error: `Validation Error: Player does not belong to the fixture's league.` };
  }

  // 4. Duplicate player/fixture stats check
  const isDuplicate = existingStats.some(s => s.fixture_id === input.fixture_id && s.player_id === input.player_id);
  if (isDuplicate) {
    return { isValid: false, error: `Validation Error: Stats record for player ${input.player_id} in fixture ${input.fixture_id} already exists.` };
  }

  // 5. Negative and impossible statistics check
  if (input.minutes < 0 || input.minutes > 120) {
    return { isValid: false, error: `Validation Error: Invalid minutes (${input.minutes}). Must be between 0 and 120.` };
  }
  if (input.goals < 0 || input.goals > 10) {
    return { isValid: false, error: `Validation Error: Invalid goals count (${input.goals}).` };
  }
  if (input.assists < 0 || input.assists > 10) {
    return { isValid: false, error: `Validation Error: Invalid assists count (${input.assists}).` };
  }
  if (input.yellow_cards < 0 || input.yellow_cards > 2) {
    return { isValid: false, error: `Validation Error: Invalid yellow cards count (${input.yellow_cards}).` };
  }
  if (input.red_cards < 0 || input.red_cards > 1) {
    return { isValid: false, error: `Validation Error: Invalid red cards count (${input.red_cards}).` };
  }
  if (input.saves < 0 || input.saves > 30) {
    return { isValid: false, error: `Validation Error: Invalid saves count (${input.saves}).` };
  }

  return { isValid: true };
}

const mockDbPlayers = [
  { id: 'p_arsenal_1', leagueId: 'premier-league' },
  { id: 'p_barca_1', leagueId: 'la-liga' }
];

const mockDbFixtures = [
  { id: 'fix_pl_1', league_id: 'premier-league' },
  { id: 'fix_ll_1', league_id: 'la-liga' }
];

const mockExistingStats: Array<{ fixture_id: string; player_id: string }> = [
  { fixture_id: 'fix_pl_1', player_id: 'p_arsenal_1' }
];

// Test valid input
const validCheck = validatePlayerMatchStatsInput(
  { fixture_id: 'fix_pl_1', player_id: 'p_arsenal_1', league_id: 'premier-league', minutes: 90, goals: 1, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 },
  mockDbPlayers, mockDbFixtures, [] // empty existing stats for this player/fixture pair
);
assert(validCheck.isValid === true, 'Validation accepts valid stats record');

// Test nonexistent player
const badPlayerCheck = validatePlayerMatchStatsInput(
  { fixture_id: 'fix_pl_1', player_id: 'nonexistent', league_id: 'premier-league', minutes: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 },
  mockDbPlayers, mockDbFixtures, mockExistingStats
);
assert(badPlayerCheck.isValid === false, 'Validation rejects nonexistent player');

// Test nonexistent fixture
const badFixtureCheck = validatePlayerMatchStatsInput(
  { fixture_id: 'fix_bad', player_id: 'p_arsenal_1', league_id: 'premier-league', minutes: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 },
  mockDbPlayers, mockDbFixtures, mockExistingStats
);
assert(badFixtureCheck.isValid === false, 'Validation rejects nonexistent fixture');

// Test league mismatch
const leagueMismatchCheck = validatePlayerMatchStatsInput(
  { fixture_id: 'fix_ll_1', player_id: 'p_arsenal_1', league_id: 'la-liga', minutes: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 },
  mockDbPlayers, mockDbFixtures, mockExistingStats
);
assert(leagueMismatchCheck.isValid === false, 'Validation rejects player playing in mismatched league fixture');

// Test duplicate stats
const duplicateCheck = validatePlayerMatchStatsInput(
  { fixture_id: 'fix_pl_1', player_id: 'p_arsenal_1', league_id: 'premier-league', minutes: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 },
  mockDbPlayers, mockDbFixtures, mockExistingStats
);
assert(duplicateCheck.isValid === false, 'Validation rejects duplicate player/fixture stats');

// Test impossible minutes
const impossibleMinutesCheck = validatePlayerMatchStatsInput(
  { fixture_id: 'fix_pl_1', player_id: 'p_arsenal_1', league_id: 'premier-league', minutes: 150, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0, penalty_saved: 0, penalty_missed: 0, own_goals: 0, saves: 0, bonus: 0 },
  mockDbPlayers, mockDbFixtures, []
);
assert(impossibleMinutesCheck.isValid === false, 'Validation rejects impossible minutes (> 120)');

console.log('🎉 ALL FANTASY SCORING, CAPTAIN RULES, AND VALIDATION TESTS PASSED SUCCESSFULLY IN MEMORY!');
