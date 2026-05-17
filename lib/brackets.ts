// Single-elimination bracket generation for tournaments

export interface BracketParticipant {
  id: string;
  label: string;
}

export interface BracketMatchSeed {
  round: string;
  matchNumber: number;
  homeLabel: string | null;
  awayLabel: string | null;
  homeAthleteId?: string | null;
  awayAthleteId?: string | null;
}

export interface BracketStructure {
  format: "single_elimination";
  participantCount: number;
  rounds: string[];
  matches: BracketMatchSeed[];
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function generateSingleEliminationBracket(
  participants: BracketParticipant[]
): BracketStructure {
  const size = nextPowerOfTwo(Math.max(participants.length, 2));
  const slots: (BracketParticipant | null)[] = [...participants];
  while (slots.length < size) slots.push(null);

  const roundCount = Math.log2(size);
  const roundNames = Array.from({ length: roundCount }, (_, i) => {
    const remaining = size / Math.pow(2, i + 1);
    if (remaining === 1) return "Final";
    if (remaining === 2) return "Semi-Final";
    if (remaining === 4) return "Quarter-Final";
    return `Round ${i + 1}`;
  });

  const matches: BracketMatchSeed[] = [];
  let matchNumber = 1;

  for (let i = 0; i < size; i += 2) {
    const home = slots[i];
    const away = slots[i + 1];
    matches.push({
      round: roundNames[0],
      matchNumber: matchNumber++,
      homeLabel: home?.label ?? "TBD",
      awayLabel: away?.label ?? "BYE",
      homeAthleteId: home?.id ?? null,
      awayAthleteId: away?.id ?? null,
    });
  }

  const matchesInFirstRound = size / 2;
  for (let r = 1; r < roundCount; r++) {
    const count = matchesInFirstRound / Math.pow(2, r);
    for (let m = 0; m < count; m++) {
      matches.push({
        round: roundNames[r],
        matchNumber: matchNumber++,
        homeLabel: "TBD",
        awayLabel: "TBD",
      });
    }
  }

  return {
    format: "single_elimination",
    participantCount: participants.length,
    rounds: roundNames,
    matches,
  };
}
