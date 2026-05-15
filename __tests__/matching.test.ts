// Matching algorithm unit tests.
// To run: install jest-expo + @types/jest, add a "test" script in package.json,
// then `npm test`. See SETUP_CHECKLIST.md for the install bundle.
//
// These tests are the moat: deterministic matching must NEVER drift.
// If you change scoring weights or hustle fingerprints, re-run these
// and update fixtures with rationale in DECISIONS.md.

import { topMatches, buildUserVector, profileSummary } from '../src/lib/score';
import { HUSTLES } from '../src/lib/hustles';

// Helper — build a typical answer set for a "investigator-builder, recurring-leaning, high-hours, $1k budget" user.
const PROFILE_A = {
  q1: ['Writing', 'Research', 'Coding'],
  q2: ['solve', 'build', 'pretty', 'help', 'sell'],
  q3: ['focused', 'organized', 'ready'],
  q4: 'finisher',
  q5: 'fifty',
  q6: 'fine',
  q7: 'slow',
  q8: 'can',
  q9: { hours: 15, budget: 1000 },
  q10: [],
};

// Helper — "high-extroversion, sales-leaning, cash-fast, low-budget" user.
const PROFILE_B = {
  q1: ['Talking to strangers', 'Sales', 'Social media'],
  q2: ['sell', 'help', 'build', 'solve', 'pretty'],
  q3: ['energized', 'ready'],
  q4: 'few',
  q5: 'gigs',
  q6: 'buzzing',
  q7: 'fast',
  q8: 'born',
  q9: { hours: 10, budget: 100 },
  q10: [],
};

// Helper — "won't do on-camera, cold-call, inventory" user.
const PROFILE_C = {
  ...PROFILE_A,
  q10: ['b-camera', 'b-cold', 'b-inventory'],
};

// Helper — extremely low hours + budget.
const PROFILE_D = {
  ...PROFILE_A,
  q9: { hours: 1, budget: 0 },
};

describe('matching: determinism', () => {
  test('same input → same matches across reruns', () => {
    const a = topMatches(PROFILE_A, 3);
    const b = topMatches(PROFILE_A, 3);
    expect(a.matches.map((m) => m.hustle.id)).toEqual(b.matches.map((m) => m.hustle.id));
    expect(a.matches.map((m) => m.score)).toEqual(b.matches.map((m) => m.score));
  });

  test('same input → same axis vector', () => {
    const a = buildUserVector(PROFILE_A);
    const b = buildUserVector(PROFILE_A);
    expect(a.vec).toEqual(b.vec);
    expect(a.skills.sort()).toEqual(b.skills.sort());
    expect(a.blockers).toEqual(b.blockers);
  });
});

describe('matching: hard filters', () => {
  test('won\'t-do filter excludes hustles whose blockerTags contain a user blocker', () => {
    const { matches } = topMatches(PROFILE_C, 30);
    matches.forEach((m) => {
      expect(m.hustle.blockerTags.includes('on-camera')).toBe(false);
      expect(m.hustle.blockerTags.includes('cold-call')).toBe(false);
      expect(m.hustle.blockerTags.includes('inventory')).toBe(false);
    });
  });

  test('hours filter excludes hustles whose hoursMin > user hours', () => {
    const { user, matches } = topMatches(PROFILE_D, 30);
    expect(user.hours).toBeLessThanOrEqual(5);
    matches.forEach((m) => {
      expect(m.hustle.hoursMin).toBeLessThanOrEqual(user.hours);
    });
  });

  test('budget filter excludes hustles whose startCost > user budget', () => {
    const { user, matches } = topMatches(PROFILE_D, 30);
    expect(user.budget).toBe(0);
    matches.forEach((m) => {
      expect(m.hustle.startCost).toBeLessThanOrEqual(user.budget);
    });
  });
});

describe('matching: ranking', () => {
  test('returns at most N matches', () => {
    expect(topMatches(PROFILE_A, 3).matches.length).toBeLessThanOrEqual(3);
    expect(topMatches(PROFILE_A, 5).matches.length).toBeLessThanOrEqual(5);
  });

  test('matches are sorted by score descending', () => {
    const { matches } = topMatches(PROFILE_A, 10);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i - 1].score).toBeGreaterThanOrEqual(matches[i].score);
    }
  });

  test('scores fall in display range 60..98', () => {
    const { matches } = topMatches(PROFILE_A, 30);
    matches.forEach((m) => {
      expect(m.score).toBeGreaterThanOrEqual(60);
      expect(m.score).toBeLessThanOrEqual(98);
    });
  });

  test('every match has at least one why-bullet', () => {
    const { matches } = topMatches(PROFILE_A, 3);
    matches.forEach((m) => expect(m.why.length).toBeGreaterThan(0));
  });

  test('top match is in expected hustle set for builder-investigator-recurring profile', () => {
    // PROFILE_A → likely SaaS, newsletter, or digital products. We test that
    // the top match is one of a sensible set, not a specific hustle (which
    // could over-fit and flake on small scoring tweaks).
    const expected = new Set([
      'h-newsletter-lawyers', 'h-newsletter-pms', 'h-substack-essays',
      'h-listing-summarizer', 'h-voice-agent-dental', 'h-niche-scheduler',
      'h-figma-kits', 'h-notion-therapists', 'h-prompt-pack', 'h-niche-course',
      'h-seo-audits', 'h-web-dev-retainer', 'h-ai-workflow', 'h-cold-email',
    ]);
    const { matches } = topMatches(PROFILE_A, 1);
    expect(matches.length).toBe(1);
    expect(expected.has(matches[0].hustle.id)).toBe(true);
  });

  test('extrovert-cash-fast profile surfaces sales/local/creator-services', () => {
    const expected = new Set([
      'h-mobile-detail', 'h-pressure-washing', 'h-dog-wash',
      'h-cold-email', 'h-ugc-dtc', 'h-thumbnails', 'h-short-clips',
      'h-whatnot-toys', 'h-career-coaching', 'h-personal-training',
    ]);
    const { matches } = topMatches(PROFILE_B, 1);
    expect(matches.length).toBe(1);
    expect(expected.has(matches[0].hustle.id)).toBe(true);
  });
});

describe('matching: profile summary', () => {
  test('emits a non-empty goalReadout for a well-answered quiz', () => {
    const p = profileSummary(PROFILE_A);
    expect(p.goalReadout.length).toBeGreaterThan(0);
  });

  test('confidence is "high" when deep-dive answers present', () => {
    const withDeep = { ...PROFILE_A, q11: 'lab', q12: 'wild' };
    const p = profileSummary(withDeep);
    expect(p.confidence).toBe('high');
  });

  test('confidence is "medium" when only snap questions answered', () => {
    const p = profileSummary(PROFILE_A);
    expect(p.confidence).toBe('medium');
  });

  test('signalsCaptured counts non-empty answers', () => {
    const p = profileSummary(PROFILE_A);
    expect(p.signalsCaptured).toBe(Object.keys(PROFILE_A).filter((k) => {
      const v = (PROFILE_A as any)[k];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null;
    }).length);
  });
});

describe('matching: edge cases', () => {
  test('empty answers does not crash', () => {
    expect(() => topMatches({}, 3)).not.toThrow();
  });

  test('every catalog hustle has a fingerprint of length 17', () => {
    HUSTLES.forEach((h) => {
      expect(h.fingerprint.length).toBe(17);
      h.fingerprint.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    });
  });

  test('hustle slugs are unique', () => {
    const slugs = HUSTLES.map((h) => h.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('hustle ids are unique', () => {
    const ids = HUSTLES.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
