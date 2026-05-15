// Module-level flag for whether the intro animation should play this session.
// On cold launch, this module re-evaluates and `shownThisSession` resets to false.
// On hot reload during dev, the module is re-imported — we accept the intro re-plays.
// First-touch only within a single JS lifetime; intro plays again on next cold launch.

let shownThisSession = false;

export function shouldShowIntro(): boolean {
  return !shownThisSession;
}

export function markIntroShown(): void {
  shownThisSession = true;
}
