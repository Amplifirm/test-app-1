import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { Screen, TopBar, CTADock } from '~/components/screen';
import { CTA, MonoLabel, Row, Tag, Dot, Icon } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { topMatches } from '~/lib/score';
import { getHustleBySlug } from '~/lib/hustles';
import { PRODUCTS, type ProductId, purchase, restorePurchases, getOfferings, type Offering } from '~/lib/purchases';
import { trigger as superwallTrigger } from '~/lib/superwall';
import { track } from '~/lib/analytics';

type Variant = 'annual' | 'weekly' | 'lifetime';

const VARIANT_TO_PRODUCT: Record<Variant, ProductId> = {
  annual: PRODUCTS.ANNUAL,
  weekly: PRODUCTS.WEEKLY,
  lifetime: PRODUCTS.LIFETIME,
};

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string; from?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : undefined;
  const answers = useApp((s) => s.answers);
  const unlock = useApp((s) => s.unlock);

  const [selected, setSelected] = useState<Variant>('annual');
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [downsellOpen, setDownsellOpen] = useState(false);
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);

  // Determine which hustle the paywall is unlocking
  const hustle = useMemo(() => {
    if (slug) return getHustleBySlug(slug);
    const top = topMatches(answers, 1).matches[0];
    return top?.hustle ?? null;
  }, [slug, answers]);

  const topMatch = useMemo(() => topMatches(answers, 1).matches[0], [answers]);
  const fitPct = topMatch?.score ?? 0;

  useEffect(() => {
    // Try Superwall first; if a remote campaign is active it'll present a paywall and we stay quiet.
    (async () => {
      const result = await superwallTrigger('match_unlock', { hustleSlug: hustle?.slug });
      if (result.presented) router.back(); // remote took over
    })();
    void getOfferings().then(setOfferings);
    void track('paywall_viewed', { variantId: 'native_v1', trigger: 'match_unlock', hustleSlug: hustle?.slug });
  }, []);

  const offering = (variant: Variant) => offerings.find((o) => o.productId === VARIANT_TO_PRODUCT[variant]);
  const annualOffering = offering('annual');
  const weeklyOffering = offering('weekly');
  const lifetimeOffering = offering('lifetime');

  const handlePurchase = async () => {
    if (busy) return;
    setBusy('purchase');
    try {
      const productId = VARIANT_TO_PRODUCT[selected];
      const res = await purchase(productId);
      if (res.ok) {
        void track('subscription_purchased', { productId, price: offering(selected)?.priceString });
        if (selected === 'annual' && annualOffering?.trialDays) {
          void track('trial_started', { productId });
        }
        unlock('__all__', true);
        router.replace(hustle ? `/playbook/${hustle.slug}` : '/results');
      } else if (res.error === 'cancelled') {
        // user cancelled — stay on paywall, no toast
      } else if (res.error === 'not_configured') {
        // dev/no-RC case: optimistic local unlock for demo
        if (__DEV__) {
          unlock('__all__', true);
          router.replace(hustle ? `/playbook/${hustle.slug}` : '/results');
        }
      }
    } finally {
      setBusy(null);
    }
  };

  const handleSinglePurchase = async () => {
    if (!hustle || busy) return;
    setBusy('purchase');
    try {
      const res = await purchase(PRODUCTS.PLAYBOOK_SINGLE, { hustleId: hustle.id });
      if (res.ok) {
        void track('single_playbook_purchased', { hustleId: hustle.id, price: '$4.99' });
        unlock(hustle.slug);
        setDownsellOpen(false);
        router.replace(`/playbook/${hustle.slug}`);
      }
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy('restore');
    void track('restore_purchases_attempted');
    try {
      await restorePurchases();
      // restorePurchases reconciles entitlements via RevenueCat → server.
      // If user truly has entitlement, they'll see content unlock on next render
      // (entitlement check happens in playbook screen).
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <TopBar
        onBack={() => {
          void track('paywall_dismissed', { variantId: 'native_v1' });
          router.back();
        }}
        label={null}
        right={
          <Pressable onPress={handleRestore}>
            <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 13 }}>Restore</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero badge */}
        <Animated.View entering={FadeIn.delay(40).duration(360)} style={{ alignSelf: 'flex-start' }}>
          <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
            <Dot size={6} color={HA.lime} />
            <Text style={{ color: HA.lime, fontFamily: FONT.monoBold, fontSize: 11, letterSpacing: 1.2, marginLeft: 6 }}>
              LOCKED · YOUR TOP MATCH
            </Text>
          </Tag>
        </Animated.View>

        {/* Trial HEADLINE (was buried as a pill — moved up per RevenueCat tests: +15–40% trial lift) */}
        <Animated.Text
          entering={FadeInUp.delay(120).duration(420)}
          style={{ marginTop: 14, fontFamily: FONT.displayHeavy, fontSize: 30, color: HA.lime, letterSpacing: -1.2, lineHeight: 34 }}
        >
          3 days free.
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(180).duration(420)}
          style={{ marginTop: 4, color: HA.ink, fontFamily: FONT.body, fontSize: 15, lineHeight: 22 }}
        >
          Then {annualOffering?.priceString ?? '$49.99'}/year. Cancel anytime.
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(260).duration(420)}
          style={{ marginTop: 18, fontFamily: FONT.displayHeavy, fontSize: 30, color: HA.ink, letterSpacing: -1.2, lineHeight: 34 }}
        >
          {hustle?.title ?? 'Your top match'}.
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(320).duration(420)}
          style={{ marginTop: 6, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 21 }}
        >
          <Text style={{ color: HA.lime, fontFamily: FONT.bodyBold }}>{fitPct}%</Text> fit · Median {hustle?.monthly ?? '$0'}/mo in 90 days. Your 90-day playbook is one tap away.
        </Animated.Text>

        {/* Social proof row */}
        <Animated.View
          entering={FadeIn.delay(380).duration(380)}
          style={{ marginTop: 18, padding: 12, borderRadius: RADIUS.card, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Row gap={-8}>
            {[HA.lime, HA.coral, '#FFD66B'].map((c, i) => (
              <View key={i} style={{ width: 24, height: 24, borderRadius: 99, backgroundColor: c, borderWidth: 2, borderColor: HA.bg, marginLeft: i === 0 ? 0 : -8 }} />
            ))}
          </Row>
          <View style={{ flex: 1 }}>
            <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 13 }}>
              22,481 hustles matched this month
            </Text>
            <Text style={{ marginTop: 2, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 11 }}>
              4.8★ · trusted by founders worldwide
            </Text>
          </View>
        </Animated.View>

        {/* Included */}
        <View style={{ marginTop: 18, padding: 16, borderRadius: RADIUS.card, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          <MonoLabel color={HA.lime}>WHAT YOU UNLOCK</MonoLabel>
          <View style={{ gap: 10, marginTop: 12 }}>
            {[
              '12 weeks of day-by-day actions',
              '5 specific tools with pricing',
              'First-10-customers script',
              '3 outreach scripts tailored to your tone',
              'Pricing playbook + failure modes',
            ].map((line) => (
              <Row key={line} gap={10}>
                <View style={{ width: 16, height: 16, borderRadius: 99, backgroundColor: HA.lime, alignItems: 'center', justifyContent: 'center' }}>
                  {Icon.check(HA.bgDeep, 11)}
                </View>
                <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>{line}</Text>
              </Row>
            ))}
          </View>
        </View>

        {/* Plan selector */}
        <View style={{ marginTop: 18, gap: 10 }}>
          <PlanRow
            variant="annual"
            selected={selected === 'annual'}
            onSelect={() => setSelected('annual')}
            title={`Annual — ${annualOffering?.priceString ?? '$49.99'}/year`}
            subtitle="3-day free trial · just $0.96/week"
            tag="SAVE 86%"
          />
          <PlanRow
            variant="weekly"
            selected={selected === 'weekly'}
            onSelect={() => setSelected('weekly')}
            title={`Weekly — ${weeklyOffering?.priceString ?? '$6.99'}/week`}
            subtitle="Try without commitment"
          />
          <PlanRow
            variant="lifetime"
            selected={selected === 'lifetime'}
            onSelect={() => setSelected('lifetime')}
            title={`Lifetime — ${lifetimeOffering?.priceString ?? '$129'} once`}
            subtitle="Equivalent to ~3 years annual · no renewals"
          />
        </View>

        {/* Single-playbook downsell link */}
        <Pressable onPress={() => setDownsellOpen(true)} style={{ marginTop: 16, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 13, textDecorationLine: 'underline' }}>
            Just this one playbook — $4.99
          </Text>
        </Pressable>

        {/* Trust footer */}
        <Text style={{ marginTop: 12, color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, textAlign: 'center' }}>
          14-DAY REFUND · NO SPAM · CANCEL ANYTIME
        </Text>

        {/* Legal footer */}
        <Row justify="center" gap={16} style={{ marginTop: 14 }}>
          <Pressable onPress={() => router.push('/legal/terms')}>
            <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 11, textDecorationLine: 'underline' }}>Terms</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/legal/privacy')}>
            <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 11, textDecorationLine: 'underline' }}>Privacy</Text>
          </Pressable>
        </Row>
      </ScrollView>

      <CTADock padH={0}>
        <CTA onPress={handlePurchase} disabled={busy !== null} hapticKind="success">
          <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 17 }}>
            {selected === 'annual' && annualOffering?.trialDays ? 'Start 3-day free trial' : 'Continue'}
          </Text>
          {Icon.arrow(HA.bgDeep)}
        </CTA>
      </CTADock>

      {/* Single-playbook modal */}
      <Modal visible={downsellOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: HA.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: HA.stroke }}>
            <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 28, color: HA.ink, letterSpacing: -1, lineHeight: 32 }}>
              Not ready for the subscription?
            </Text>
            <Text style={{ marginTop: 10, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 21 }}>
              Get just this one playbook for $4.99. No subscription, no trial. Yours forever.
            </Text>
            <View style={{ marginTop: 18 }}>
              <CTA onPress={handleSinglePurchase} disabled={busy !== null}>
                <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 16 }}>
                  Unlock this playbook — $4.99
                </Text>
              </CTA>
            </View>
            <Pressable onPress={() => setDownsellOpen(false)} style={{ marginTop: 14, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 13 }}>
                ← Back to subscription options
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function PlanRow({
  variant, selected, onSelect, title, subtitle, tag,
}: {
  variant: Variant;
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  tag?: string;
}) {
  const scale = useSharedValue(selected ? 1.02 : 1);
  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.02 : 1, { damping: 16, stiffness: 220 });
  }, [selected]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => ({
          padding: 14,
          borderRadius: RADIUS.card,
          backgroundColor: selected ? HA.limeSoft : HA.surface,
          borderWidth: 1,
          borderColor: selected ? HA.strokeLime : HA.stroke,
          opacity: pressed ? 0.92 : 1,
          shadowColor: selected ? HA.lime : 'transparent',
          shadowOpacity: selected ? 0.18 : 0,
          shadowRadius: selected ? 16 : 0,
          shadowOffset: { width: 0, height: 6 },
          elevation: selected ? 4 : 0,
        })}
      >
        <Row justify="space-between">
          <View style={{ flex: 1 }}>
            <Row gap={8}>
              <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15 }}>{title}</Text>
              {tag ? (
                <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
                  <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 9, letterSpacing: 1 }}>{tag}</Text>
                </Tag>
              ) : null}
            </Row>
            <Text style={{ marginTop: 4, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>{subtitle}</Text>
          </View>
          <View style={{
            width: 22, height: 22, borderRadius: 99,
            borderWidth: 2, borderColor: selected ? HA.lime : HA.strokeBold,
            alignItems: 'center', justifyContent: 'center',
          }}>
            {selected ? <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: HA.lime }} /> : null}
          </View>
        </Row>
      </Pressable>
    </Animated.View>
  );
}
