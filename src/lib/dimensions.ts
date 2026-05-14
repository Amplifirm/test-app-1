// 17 scored dimensions (RIASEC 6 + Personality 3 + Goal/JTBD 8)
// + 4 hard filters (hours, budget, skills[], blockers[]) — stored separately.

export const DIM = {
  // RIASEC
  R: 0, I: 1, A: 2, S: 3, E: 4, C: 5,
  // Personality
  Conscient: 6, Extra: 7, Open: 8,
  // Goal / JTBD
  IncomeTarget: 9,
  Speed: 10,             // time_to_first_dollar — high = needs cash fast
  Recurring: 11,         // income_shape — high = recurring
  Risk: 12,
  Sprint: 13,            // effort_curve — high = sprint-then-coast
  Scale: 14,             // scale_ambition
  Visibility: 15,        // visibility_tolerance
  Team: 16,              // solo_vs_team — high = build team
} as const;

export const DIM_NAMES: Record<number, string> = {
  0: 'Realistic',
  1: 'Investigative',
  2: 'Artistic',
  3: 'Social',
  4: 'Enterprising',
  5: 'Conventional',
  6: 'Conscientiousness',
  7: 'Extraversion',
  8: 'Openness',
  9: 'Income target',
  10: 'Speed-to-first-dollar',
  11: 'Recurring income',
  12: 'Risk appetite',
  13: 'Sprint vs sustained',
  14: 'Scale ambition',
  15: 'Visibility tolerance',
  16: 'Solo vs team',
};

export const VECTOR_LEN = 17;

export const RIASEC_DIMS = [DIM.R, DIM.I, DIM.A, DIM.S, DIM.E, DIM.C];
export const PERSONALITY_DIMS = [DIM.Conscient, DIM.Extra, DIM.Open];
export const GOAL_DIMS = [
  DIM.IncomeTarget, DIM.Speed, DIM.Recurring, DIM.Risk,
  DIM.Sprint, DIM.Scale, DIM.Visibility, DIM.Team,
];

// Per-family weights for cosine combination
export const FAMILY_WEIGHT = {
  goal: 0.40,
  riasec: 0.30,
  personality: 0.15,
  skills: 0.15,
} as const;

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
