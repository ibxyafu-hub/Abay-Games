import { calculatePlayerMatchPoints, calculateSquadTotalPoints, validateSquad, validateCaptains } from '../src/services/fantasyScoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log('=== STARTING LEADERBOARD & RESULTS IN-MEMORY TESTS ===');

// 1. Test Squad Points with Captain & Vice Captain fallback
const mockSquad = [
  { id: 'p1', position: 'GK' as const, price: 5.0, points: 6, minutesPlayed: 90 },
  { id: 'p2', position: 'DEF' as const, price: 6.0, points: 8, minutesPlayed: 90 },
  { id: 'p3', position: 'DEF' as const, price: 5.5, points: 2, minutesPlayed: 90 },
  { id: 'p4', position: 'DEF' as const, price: 5.0, points: 1, minutesPlayed: 90 },
  { id: 'p5', position: 'DEF' as const, price: 4.5, points: 0, minutesPlayed: 90 },
  { id: 'p6', position: 'MID' as const, price: 8.5, points: 12, minutesPlayed: 90 },
  { id: 'p7', position: 'MID' as const, price: 8.0, points: 5, minutesPlayed: 90 },
  { id: 'p8', position: 'MID' as const, price: 7.5, points: 3, minutesPlayed: 90 },
  { id: 'p9', position: 'MID' as const, price: 7.0, points: 2, minutesPlayed: 90 },
  { id: 'p10', position: 'FWD' as const, price: 11.0, points: 15, minutesPlayed: 0 }, // Captain did not play
  { id: 'p11', position: 'FWD' as const, price: 9.0, points: 10, minutesPlayed: 90 }  // Vice captain played
];

const squadIds = mockSquad.map(s => s.id);

// Captain is p10 (0 mins), Vice Captain is p11 (90 mins)
const calc = calculateSquadTotalPoints(mockSquad, 'p10', 'p11');

// p10 had 15 pts, but didn't play -> captain points multiplier passes to VC (p11, who had 10 pts -> doubled to 20).
// Breakdown: p1(6), p2(8), p3(2), p4(1), p5(0), p6(12), p7(5), p8(3), p9(2), p10(15 * 1 = 15), p11(10 * 2 = 20)
// Sum = 6 + 8 + 2 + 1 + 0 + 12 + 5 + 3 + 2 + 15 + 20 = 74
assert(calc.breakdown['p11'] === 20, `VC multiplier applied: p11 should have 20 pts, got ${calc.breakdown['p11']}`);
assert(calc.breakdown['p10'] === 15, `Captain who didn't play receives 1x points: got ${calc.breakdown['p10']}`);
assert(calc.totalPoints === 74, `Total points calculated correctly: got ${calc.totalPoints}`);


// 2. Test Leaderboard Ranking & Tie Breaking Determinism
interface LeaderboardEntry {
  userId: string;
  username: string;
  gameweekPoints: number;
  totalPoints: number;
  updatedAt: string;
}

function computeLeaderboardRanks(entries: LeaderboardEntry[]): Array<LeaderboardEntry & { rank: number }> {
  // Sort by totalPoints desc, then gameweekPoints desc, then username asc (for deterministic tie breaking)
  const sorted = [...entries].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.gameweekPoints !== a.gameweekPoints) {
      return b.gameweekPoints - a.gameweekPoints;
    }
    return a.username.localeCompare(b.username);
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

const mockEntries: LeaderboardEntry[] = [
  { userId: 'u1', username: 'Charlie', gameweekPoints: 60, totalPoints: 200, updatedAt: new Date().toISOString() },
  { userId: 'u2', username: 'Alice', gameweekPoints: 70, totalPoints: 220, updatedAt: new Date().toISOString() },
  { userId: 'u3', username: 'Bob', gameweekPoints: 70, totalPoints: 220, updatedAt: new Date().toISOString() }, // Tie with Alice in total, but Alice has higher GW points
  { userId: 'u4', username: 'Dave', gameweekPoints: 50, totalPoints: 180, updatedAt: new Date().toISOString() }
];

const ranked = computeLeaderboardRanks(mockEntries);

assert(ranked[0].username === 'Alice', `Rank 1 should be Alice (220 total, 70 GW), got ${ranked[0].username}`);
assert(ranked[1].username === 'Bob', `Rank 2 should be Bob (220 total, 70 GW), got ${ranked[1].username}`);
assert(ranked[2].username === 'Charlie', `Rank 3 should be Charlie (200 total), got ${ranked[2].username}`);
assert(ranked[3].username === 'Dave', `Rank 4 should be Dave (180 total), got ${ranked[3].username}`);

console.log('🎉 ALL LEADERBOARD, RANKING, AND RESULTS TESTS PASSED SUCCESSFULLY!');
