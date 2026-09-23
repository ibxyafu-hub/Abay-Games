export interface PlayerMatchStatsInput {
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
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

export interface SquadPlayerSelection {
  id: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  price: number;
  points: number;
  minutesPlayed?: number; // for VC fallback calculation
}

export function calculatePlayerMatchPoints(stats: PlayerMatchStatsInput): number {
  let pts = 0;

  // Appearance
  if (stats.minutes > 0 && stats.minutes < 60) {
    pts += 1;
  } else if (stats.minutes >= 60) {
    pts += 2;
  }

  // Goals
  if (stats.goals > 0) {
    if (stats.position === 'GK') pts += stats.goals * 10;
    else if (stats.position === 'DEF') pts += stats.goals * 6;
    else if (stats.position === 'MID') pts += stats.goals * 5;
    else if (stats.position === 'FWD') pts += stats.goals * 4;
  }

  // Assists
  if (stats.assists > 0) {
    pts += stats.assists * 3;
  }

  // Clean sheet (requires 60+ mins played usually, or general CS flag)
  if (stats.clean_sheet && stats.minutes >= 60) {
    if (stats.position === 'GK') pts += 4;
    else if (stats.position === 'DEF') pts += 4;
    else if (stats.position === 'MID') pts += 1;
    else if (stats.position === 'FWD') pts += 0;
  }

  // Goalkeeper saves (every 3 saves = +1)
  if (stats.position === 'GK' && stats.saves > 0) {
    pts += Math.floor(stats.saves / 3);
  }

  // Penalty save
  if (stats.penalty_saved > 0) {
    pts += stats.penalty_saved * 5;
  }

  // Penalty miss
  if (stats.penalty_missed > 0) {
    pts += stats.penalty_missed * -2;
  }

  // Yellow card
  if (stats.yellow_cards > 0) {
    pts += stats.yellow_cards * -1;
  }

  // Red card (retains points earned before red card)
  if (stats.red_cards > 0) {
    pts += stats.red_cards * -3;
  }

  // Own goal
  if (stats.own_goals > 0) {
    pts += stats.own_goals * -2;
  }

  // Bonus
  if (stats.bonus > 0) {
    pts += stats.bonus;
  }

  return pts;
}

export interface SquadValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateSquad(players: SquadPlayerSelection[], budget: number = 100.0): SquadValidationResult {
  if (!players || !Array.isArray(players) || players.length !== 11) {
    return { isValid: false, error: 'Squad must contain exactly 11 players.' };
  }

  let gk = 0;
  let def = 0;
  let mid = 0;
  let fwd = 0;
  let totalPrice = 0;
  const playerIds = new Set<string>();

  for (const p of players) {
    if (playerIds.has(p.id)) {
      return { isValid: false, error: 'Duplicate players are not allowed in the squad.' };
    }
    playerIds.add(p.id);

    totalPrice += Number(p.price || 0);

    if (p.position === 'GK') gk++;
    else if (p.position === 'DEF') def++;
    else if (p.position === 'MID') mid++;
    else if (p.position === 'FWD') fwd++;
    else {
      return { isValid: false, error: `Invalid position: ${p.position}` };
    }
  }

  if (gk !== 1) return { isValid: false, error: 'Squad must have exactly 1 Goalkeeper (GK).' };
  if (def !== 4) return { isValid: false, error: 'Squad must have exactly 4 Defenders (DEF).' };
  if (mid !== 4) return { isValid: false, error: 'Squad must have exactly 4 Midfielders (MID).' };
  if (fwd !== 2) return { isValid: false, error: 'Squad must have exactly 2 Forwards (FWD).' };

  if (Number(totalPrice.toFixed(1)) > budget) {
    return { isValid: false, error: `Squad total price (${totalPrice.toFixed(1)}M) exceeds the ${budget}M budget limit.` };
  }

  return { isValid: true };
}

export function validateCaptains(captainId: string, viceCaptainId: string, squadPlayerIds: string[]): SquadValidationResult {
  if (!captainId) return { isValid: false, error: 'Captain must be selected.' };
  if (!viceCaptainId) return { isValid: false, error: 'Vice Captain must be selected.' };
  if (captainId === viceCaptainId) return { isValid: false, error: 'Captain and Vice Captain cannot be the same player.' };
  if (!squadPlayerIds.includes(captainId)) return { isValid: false, error: 'Captain must be one of the 11 squad players.' };
  if (!squadPlayerIds.includes(viceCaptainId)) return { isValid: false, error: 'Vice Captain must be one of the 11 squad players.' };

  return { isValid: true };
}

export function calculateSquadTotalPoints(
  squadPlayers: Array<{ id: string; points: number; minutesPlayed?: number }>,
  captainId: string,
  viceCaptainId: string
): { totalPoints: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let captainPlayed = true;
  const captainObj = squadPlayers.find(p => p.id === captainId);
  if (captainObj && (captainObj.minutesPlayed !== undefined && captainObj.minutesPlayed === 0)) {
    captainPlayed = false;
  }

  const effectiveCaptainId = captainPlayed ? captainId : viceCaptainId;

  let totalPoints = 0;
  for (const p of squadPlayers) {
    let pPts = p.points || 0;
    if (p.id === effectiveCaptainId) {
      pPts = pPts * 2;
    }
    breakdown[p.id] = pPts;
    totalPoints += pPts;
  }

  return { totalPoints, breakdown };
}
