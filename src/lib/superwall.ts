// Superwall — remote paywall control plane.
// TODO_INSTALL: `npx expo install @superwall/react-native-superwall`
// Native module, requires EAS dev client.
//
// Architecture: native paywall at `app/paywall.tsx` is the FALLBACK.
// Superwall fires a remote paywall when a campaign is active for the
// trigger 'match_unlock'. If no active campaign, fallback fires.

let _initialized = false;

export async function initializeSuperwall(): Promise<void> {
  if (_initialized) return;
  const key = process.env.EXPO_PUBLIC_SUPERWALL_KEY;
  if (!key) {
    if (__DEV__) console.log('[superwall] no key set — fallback paywall will always show');
    _initialized = true;
    return;
  }
  // LOCAL_MOCK: when SDK installed, replace with:
  //   const Superwall = require('@superwall/react-native-superwall').default;
  //   await Superwall.configure({ apiKey: key });
  _initialized = true;
}

/**
 * Fire a Superwall trigger. Returns `presented: true` if remote paywall
 * was shown (caller should NOT show its own paywall), or `false` to fall
 * back to native paywall.
 */
export async function trigger(eventName: string, params?: Record<string, unknown>): Promise<{ presented: boolean }> {
  await initializeSuperwall();
  const key = process.env.EXPO_PUBLIC_SUPERWALL_KEY;
  if (!key) return { presented: false };
  // LOCAL_MOCK: real impl:
  //   const result = await Superwall.register({ event: eventName, params });
  //   return { presented: result.didPresentPaywall };
  return { presented: false };
}

/** Identify the current user — pass profile.id so Superwall can target by user. */
export async function identifySuperwall(userId: string): Promise<void> {
  await initializeSuperwall();
  // LOCAL_MOCK: Superwall.identify({ userId });
}
