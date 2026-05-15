// RevenueCat wiring — scaffolded but the SDK is not imported yet.
// TODO_INSTALL: `npx expo install react-native-purchases`
// Then replace the LOCAL_MOCK branch with real Purchases.* calls.
//
// Why deferred: react-native-purchases is a native module. It cannot run
// in Expo Go — requires an EAS dev client build. Build pipeline is wired
// in eas.json and SETUP_CHECKLIST.md.

import { getDeviceId } from './auth';
import { recordEntitlement } from './db';
import type { EntitlementType } from './database.types';

// ──────────────────────────────────────────────────────────────────────
// PRODUCT IDS — must match App Store Connect + Google Play Console
// ──────────────────────────────────────────────────────────────────────
export const PRODUCTS = {
  WEEKLY: 'hustleai_weekly_699',
  ANNUAL: 'hustleai_annual_4999',
  LIFETIME: 'hustleai_lifetime_12900',
  PLAYBOOK_SINGLE: 'hustleai_playbook_single_499',
  PREMIUM_UPGRADE: 'hustleai_premium_1499',
} as const;

export type ProductId = (typeof PRODUCTS)[keyof typeof PRODUCTS];

export const PRODUCT_TO_ENTITLEMENT_TYPE: Record<ProductId, EntitlementType> = {
  [PRODUCTS.WEEKLY]: 'subscription_weekly',
  [PRODUCTS.ANNUAL]: 'subscription_annual',
  [PRODUCTS.LIFETIME]: 'subscription_lifetime',
  [PRODUCTS.PLAYBOOK_SINGLE]: 'playbook_single',
  [PRODUCTS.PREMIUM_UPGRADE]: 'premium_upgrade',
};

export type Offering = {
  productId: ProductId;
  priceString: string; // localized, e.g. "$49.99"
  period: 'weekly' | 'annual' | 'lifetime' | 'one_time';
  trialDays?: number;
};

const FALLBACK_OFFERINGS: Offering[] = [
  { productId: PRODUCTS.WEEKLY, priceString: '$6.99', period: 'weekly' },
  { productId: PRODUCTS.ANNUAL, priceString: '$49.99', period: 'annual', trialDays: 3 },
  { productId: PRODUCTS.LIFETIME, priceString: '$129', period: 'lifetime' },
  { productId: PRODUCTS.PLAYBOOK_SINGLE, priceString: '$4.99', period: 'one_time' },
];

// ──────────────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────────────
let _initialized = false;

export async function initializePurchases(): Promise<void> {
  if (_initialized) return;
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (!iosKey && !androidKey) {
    if (__DEV__) console.log('[purchases] no RevenueCat key set — using local mock');
    _initialized = true;
    return;
  }
  // LOCAL_MOCK: when react-native-purchases is installed, replace below with:
  //   const Purchases = require('react-native-purchases').default;
  //   await Purchases.configure({ apiKey: Platform.OS === 'ios' ? iosKey : androidKey });
  //   Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
  _initialized = true;
}

// ──────────────────────────────────────────────────────────────────────
// OFFERINGS
// ──────────────────────────────────────────────────────────────────────
export async function getOfferings(): Promise<Offering[]> {
  await initializePurchases();
  // LOCAL_MOCK: real impl reads from `Purchases.getOfferings()` and maps
  // to our Offering shape. For now return fallback prices.
  return FALLBACK_OFFERINGS;
}

// ──────────────────────────────────────────────────────────────────────
// PURCHASE
// ──────────────────────────────────────────────────────────────────────
export type PurchaseResult =
  | { ok: true; productId: ProductId; rawPurchaseId?: string }
  | { ok: false; error: 'cancelled' | 'declined' | 'not_configured' | 'unknown'; message?: string };

export async function purchase(productId: ProductId, opts?: { hustleId?: string }): Promise<PurchaseResult> {
  await initializePurchases();
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  if (!iosKey) {
    if (__DEV__) {
      console.log('[purchases] mock purchase — granting local entitlement');
      const deviceId = await getDeviceId();
      await recordEntitlement(
        { deviceId },
        PRODUCT_TO_ENTITLEMENT_TYPE[productId],
        'manual',
        { hustleId: opts?.hustleId }
      );
      return { ok: true, productId };
    }
    return { ok: false, error: 'not_configured' };
  }
  // LOCAL_MOCK: real impl:
  //   const { customerInfo } = await Purchases.purchaseProduct(productId);
  //   const entitlement = customerInfo.entitlements.active['pro'];
  //   if (entitlement) { record + return ok }
  return { ok: false, error: 'unknown', message: 'real SDK not yet wired' };
}

// ──────────────────────────────────────────────────────────────────────
// RESTORE
// ──────────────────────────────────────────────────────────────────────
export async function restorePurchases(): Promise<{ count: number }> {
  await initializePurchases();
  // LOCAL_MOCK: real impl calls Purchases.restorePurchases() and reconciles.
  return { count: 0 };
}

// ──────────────────────────────────────────────────────────────────────
// GET ACTIVE ENTITLEMENTS (server source-of-truth)
// ──────────────────────────────────────────────────────────────────────
export async function getActiveEntitlementsFromStore(): Promise<{ ids: string[] }> {
  // LOCAL_MOCK: real impl reads from Purchases.getCustomerInfo().entitlements.active
  return { ids: [] };
}
