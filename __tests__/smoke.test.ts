// Smoke tests — verify core modules can be imported and main exports exist.
// Requires jest + jest-expo. See SETUP_CHECKLIST.md install bundle.
// React Native renderers (Screen / Paywall / etc.) are NOT mounted here —
// add @testing-library/react-native when you wire those up.

describe('smoke: imports', () => {
  test('quiz schema exports 17 questions', async () => {
    const { QUESTIONS, TOTAL_SIGNALS, SNAP_QUESTIONS, DEEP_QUESTIONS } = await import('../src/lib/quiz-schema');
    expect(QUESTIONS.length).toBe(17);
    expect(TOTAL_SIGNALS).toBe(17);
    expect(SNAP_QUESTIONS.length).toBe(10);
    expect(DEEP_QUESTIONS.length).toBe(7);
  });

  test('hustles catalog exports 30 hustles in 8 buckets', async () => {
    const { HUSTLES, BUCKETS } = await import('../src/lib/hustles');
    expect(HUSTLES.length).toBe(30);
    expect(BUCKETS.length).toBe(8);
  });

  test('scoring exports work as expected', async () => {
    const { buildUserVector, topMatches, profileSummary } = await import('../src/lib/score');
    expect(typeof buildUserVector).toBe('function');
    expect(typeof topMatches).toBe('function');
    expect(typeof profileSummary).toBe('function');
  });

  test('purchases lib exports products with correct IDs', async () => {
    const { PRODUCTS, PRODUCT_TO_ENTITLEMENT_TYPE } = await import('../src/lib/purchases');
    expect(PRODUCTS.WEEKLY).toBe('hustleai_weekly_699');
    expect(PRODUCTS.ANNUAL).toBe('hustleai_annual_4999');
    expect(PRODUCTS.LIFETIME).toBe('hustleai_lifetime_12900');
    expect(PRODUCTS.PLAYBOOK_SINGLE).toBe('hustleai_playbook_single_499');
    expect(PRODUCT_TO_ENTITLEMENT_TYPE[PRODUCTS.ANNUAL]).toBe('subscription_annual');
  });

  test('analytics exports typed event surface', async () => {
    const { track, identify, reset } = await import('../src/lib/analytics');
    expect(typeof track).toBe('function');
    expect(typeof identify).toBe('function');
    expect(typeof reset).toBe('function');
  });
});
