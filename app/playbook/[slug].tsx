import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { Screen, TopBar, CTADock } from '~/components/screen';
import { Row, Stack, Tag, Dot, Sticker, Icon, CTA, MonoLabel, CTAOutline } from '~/components/atoms';
import { CountUp } from '~/components/count-up';
import { StreakFlame } from '~/components/streak-flame';
import { PlaybookProgressBar } from '~/components/playbook-progress-bar';
import { PlaybookTabs, type TabKey } from '~/components/playbook-tabs';
import { TodayTaskCard } from '~/components/today-task-card';
import { WeekMilestoneCard } from '~/components/week-milestone-card';
import { PauseSheet } from '~/components/pause-sheet';
import { CoachChat } from '~/components/coach-chat';
import { useApp } from '~/lib/store';
import { getHustleBySlug, Hustle } from '~/lib/hustles';
import { topMatches } from '~/lib/score';
import { loadPlaybook, loadPersonalizedFromCache, fetchAndCachePersonalized, fallbackPersonalized } from '~/lib/playbook';
import { exportPlaybookPDF } from '~/lib/pdf';
import { haptic } from '~/hooks/useHaptic';
import type { Playbook, PersonalizedLayer, PlaybookDay } from '~/lib/playbook-types';

export default function PlaybookScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const hustle = useMemo(() => slug ? getHustleBySlug(slug) : undefined, [slug]);
  const isUnlocked = useApp((s) => s.isUnlocked(slug || ''));
  const unlock = useApp((s) => s.unlock);

  if (!hustle) {
    return (
      <Screen>
        <TopBar onBack={() => router.back()} label="Not found" />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ color: HA.inkMuted, fontFamily: FONT.body }}>Hustle not found.</Text>
        </View>
      </Screen>
    );
  }

  if (isUnlocked) {
    return <Unlocked hustle={hustle} onBack={() => router.replace('/results')} />;
  }

  return (
    <Preview
      hustle={hustle}
      onBack={() => router.replace('/results')}
      onUnlock={(plan) => {
        haptic.success();
        unlock(hustle.slug, plan === 'sub');
      }}
    />
  );
}

// ── PREVIEW (paywall) ────────────────────────────────────────────────
function Preview({ hustle, onBack, onUnlock }: { hustle: Hustle; onBack: () => void; onUnlock: (plan: 'one' | 'sub') => void }) {
  const [plan, setPlan] = useState<'one' | 'sub'>('sub');
  // Subtle pulse on the MRR projection card — draws the eye to the income anchor.
  const mrrPulse = useSharedValue(1);
  useEffect(() => {
    mrrPulse.value = withRepeat(
      withSequence(withTiming(0.94, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true,
    );
  }, []);
  const mrrPulseStyle = useAnimatedStyle(() => ({ opacity: mrrPulse.value }));

  return (
    <Screen>
      <TopBar onBack={onBack} label="Match #1" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View entering={FadeIn.duration(280)}>
          <Row gap={6} wrap style={{ marginBottom: 10 }}>
            <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
              <Dot color={HA.lime} size={5} />
              <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, marginLeft: 4 }}>TOP MATCH</Text>
            </Tag>
            <Tag>{hustle.accent.toUpperCase()}</Tag>
            <Tag>{hustle.startup} START</Tag>
          </Row>

          <Text style={{
            fontFamily: FONT.displayHeavy, fontSize: 34, lineHeight: 36, letterSpacing: -1.6, color: HA.ink,
          }}>
            {hustle.title}
          </Text>
          <Text style={{ marginTop: 10, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
            {hustle.tagline}
          </Text>
        </Animated.View>

        {/* MRR projection card with count-up */}
        <Animated.View
          entering={FadeInUp.delay(120).duration(380)}
          style={[{
            marginTop: 18, padding: 18, borderRadius: 18, backgroundColor: HA.lime, position: 'relative',
          }, mrrPulseStyle]}
        >
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: 'rgba(10,10,10,0.65)', letterSpacing: 1.4, fontWeight: '600' }}>
            REALISTIC MRR · MONTH 6
          </Text>
          <Row gap={2} align="flex-end" style={{ marginTop: 6 }}>
            <CountUp
              to={hustle.monthlyEstimate}
              duration={900}
              delay={200}
              prefix="$"
              style={{ fontFamily: FONT.displayHeavy, fontSize: 60, color: HA.bgDeep, letterSpacing: -3, lineHeight: 60 }}
            />
            <Text style={{ fontFamily: FONT.body, fontSize: 14, color: 'rgba(10,10,10,0.7)', marginBottom: 8 }}> /mo</Text>
          </Row>
        </Animated.View>

        {/* Paywall card */}
        <Animated.View
          entering={FadeInUp.delay(240).duration(380)}
          style={{
            marginTop: 22, padding: 18, borderRadius: 18,
            backgroundColor: HA.surface, borderWidth: 1.5, borderColor: HA.strokeLime,
          }}
        >
          <Row justify="space-between" style={{ marginBottom: 10 }}>
            <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
              {Icon.lock(HA.lime, 10)}
              <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, marginLeft: 4, letterSpacing: 1 }}>LOCKED</Text>
            </Tag>
            <MonoLabel>14-day refund</MonoLabel>
          </Row>

          <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 20, lineHeight: 24, letterSpacing: -0.6, color: HA.ink }}>
            Get your full 90-day playbook{'\n'}
            <Text style={{ color: HA.lime }}>+ a personalized intro from your AI coach</Text>
          </Text>

          <Stack gap={6} style={{ marginTop: 12 }}>
            {[
              '12 weeks of day-by-day actions',
              '5+ specific tools with affiliate-supported pricing',
              'First-10-customers script + 3 personalized outreach scripts',
              'Pricing playbook, failure modes, real-launch comps',
              'Export to PDF — keep, share, print',
            ].map((b) => (
              <Row key={b} gap={8}>
                <View style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: HA.lime, alignItems: 'center', justifyContent: 'center' }}>
                  {Icon.check(HA.bgDeep, 10)}
                </View>
                <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 13 }}>{b}</Text>
              </Row>
            ))}
          </Stack>

          <Stack gap={10} style={{ marginTop: 16 }}>
            <PlanCard
              selected={plan === 'one'}
              accent={HA.ink}
              onPress={() => setPlan('one')}
              title="Just this playbook"
              price="$19"
              note="one-time"
              sub="Full content, AI personalization, PDF export."
            />
            <PlanCard
              selected={plan === 'sub'}
              accent={HA.lime}
              onPress={() => setPlan('sub')}
              title="All playbooks + new matches"
              price="$12"
              note="/mo"
              sub="Every playbook · weekly new matches · saturation alerts"
              best
            />
          </Stack>

          <View style={{ marginTop: 14 }}>
            <CTA onPress={() => onUnlock(plan)} hapticKind="success">
              <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 16 }}>
                {plan === 'sub' ? 'Unlock for $12/mo' : 'Unlock for $19'}
              </Text>
              {Icon.arrow(HA.bgDeep)}
            </CTA>
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function PlanCard({
  selected, accent, onPress, title, price, note, sub, best,
}: { selected: boolean; accent: string; onPress: () => void; title: string; price: string; note: string; sub: string; best?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      {
        padding: 14, borderRadius: 14, borderWidth: 1.5,
        borderColor: selected ? accent : HA.stroke,
        backgroundColor: selected ? (accent === HA.lime ? HA.limeSoft : HA.bgDeep) : 'transparent',
        opacity: pressed ? 0.9 : 1, position: 'relative',
      },
    ]}>
      {best ? <View style={{ position: 'absolute', top: -9, right: 12 }}>
        <Sticker rotate={6} style={{ position: 'relative' }}>BEST VALUE</Sticker>
      </View> : null}
      <Row justify="space-between">
        <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 13 }}>{title}</Text>
        <Text style={{ color: HA.ink, fontFamily: FONT.displayHeavy, fontSize: 20, letterSpacing: -0.7 }}>
          {price}<Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 10 }}> {note}</Text>
        </Text>
      </Row>
      <Text style={{ marginTop: 6, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>{sub}</Text>
    </Pressable>
  );
}

// ── UNLOCKED — render the rich pre-authored content + AI intro ───────
function Unlocked({ hustle, onBack }: { hustle: Hustle; onBack: () => void }) {
  const answers = useApp((s) => s.answers);
  const playbook = useMemo(() => loadPlaybook(hustle.slug), [hustle.slug]);
  const matchScore = useMemo(() => {
    const t = topMatches(answers, 3);
    const m = t.matches.find((x) => x.hustle.slug === hustle.slug);
    return m?.score ?? 90;
  }, [answers, hustle.slug]);

  const [personalized, setPersonalized] = useState<PersonalizedLayer | null>(null);
  const [personalizing, setPersonalizing] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [milestoneShown, setMilestoneShown] = useState<number | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);

  // Progress / gamification state
  const ensureProgress = useApp((s) => s.ensureProgress);
  const markDayDone = useApp((s) => s.markDayDone);
  const unlockMilestone = useApp((s) => s.unlockMilestone);
  const pausePlaybook = useApp((s) => s.pausePlaybook);
  const currentDayFn = useApp((s) => s.currentDay);
  const progress = useApp((s) => s.playbookProgress[hustle.slug]);

  // Ensure progress exists when first viewing
  useEffect(() => { ensureProgress(hustle.slug); }, [hustle.slug]);

  const currentDay = currentDayFn(hustle.slug);
  const currentWeek = Math.max(1, Math.min(12, Math.ceil(currentDay / 7)));
  const streakDays = progress?.streakDays ?? 0;
  const completedDayIds = progress?.completedDayIds ?? [];
  const milestonesHit = (progress?.milestonesHit ?? []).map((m) => m.week);
  const completedToday = completedDayIds.includes(currentDay);

  // Derive today's task — prefer v2 days, fall back to v1 weekly action
  const todayTask = useMemo<{ title: string; description: string; successCriteria: string; minutes: number } | null>(() => {
    if (!playbook) return null;
    const wk = playbook.ninetyDay.find((w) => w.week === currentWeek);
    if (!wk) return null;
    // V2: dayNumber exact match
    if (wk.days && wk.days.length) {
      const exact = wk.days.find((d) => d.dayNumber === currentDay);
      const fallback = wk.days[(currentDay - 1) % wk.days.length];
      const day: PlaybookDay = exact ?? fallback;
      return {
        title: day.title,
        description: day.description,
        successCriteria: day.successCriteria,
        minutes: day.minutes,
      };
    }
    // V1: pick the action at index (currentDay - weekStart) modulo actions length
    if (wk.actions && wk.actions.length) {
      const weekStart = (currentWeek - 1) * 7 + 1;
      const a = wk.actions[(currentDay - weekStart) % wk.actions.length];
      return {
        title: a.action,
        description: a.day ? `Suggested on ${a.day}. Part of week ${currentWeek}'s push.` : `Part of week ${currentWeek}'s push.`,
        successCriteria: a.success,
        minutes: a.minutes,
      };
    }
    return null;
  }, [playbook, currentWeek, currentDay]);

  useEffect(() => {
    (async () => {
      // 1. Try cache
      const cached = await loadPersonalizedFromCache(hustle.slug, answers);
      if (cached) {
        setPersonalized(cached);
        setPersonalizing(false);
        return;
      }
      // 2. Fetch from API
      const fresh = await fetchAndCachePersonalized(hustle.slug, answers);
      if (fresh) {
        setPersonalized(fresh);
      } else {
        // 3. Fallback
        setPersonalized(fallbackPersonalized(hustle.slug, answers));
      }
      setPersonalizing(false);
    })();
  }, [hustle.slug]);

  if (!playbook) {
    return (
      <Screen>
        <TopBar onBack={onBack} label="Loading…" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={HA.lime} />
        </View>
      </Screen>
    );
  }

  const onMarkDone = useCallback(() => {
    const { weekJustCompleted } = markDayDone(hustle.slug, currentDay);
    if (weekJustCompleted) {
      unlockMilestone(hustle.slug, weekJustCompleted, 'badge');
      haptic.success();
      setMilestoneShown(weekJustCompleted);
    }
  }, [hustle.slug, currentDay]);

  const onExport = async () => {
    if (!personalized) return;
    haptic.tapMed();
    setExporting(true);
    try {
      await exportPlaybookPDF(hustle, playbook, personalized, matchScore);
    } catch (e) {
      console.warn('PDF export failed:', (e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Screen>
      <TopBar
        onBack={onBack}
        label={<Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
          {Icon.check(HA.lime, 11)}
          <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, marginLeft: 4, letterSpacing: 1 }}>UNLOCKED</Text>
        </Tag>}
        right={
          <Pressable onPress={() => setPauseOpen(true)} hitSlop={8}>
            <Text style={{ color: HA.inkMuted, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1 }}>PAUSE</Text>
          </Pressable>
        }
      />

      {/* Sticky header: hustle title, day/streak/progress */}
      <View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: HA.stroke, marginBottom: 12 }}>
        <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 22, lineHeight: 26, letterSpacing: -1, color: HA.ink }}>
          {hustle.title}
        </Text>
        <Row justify="space-between" style={{ marginTop: 8, alignItems: 'center' }}>
          <Row gap={10} style={{ alignItems: 'center' }}>
            <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>
              Day {currentDay}<Text style={{ color: HA.inkMuted, fontFamily: FONT.body }}> of 90</Text>
            </Text>
            <View style={{ width: 1, height: 14, backgroundColor: HA.stroke }} />
            <StreakFlame days={streakDays} compact />
          </Row>
          <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 11, letterSpacing: 0.8 }}>
            Week {currentWeek}
          </Text>
        </Row>
        <View style={{ marginTop: 10 }}>
          <PlaybookProgressBar currentDay={currentDay} completedDayIds={completedDayIds} milestonesHit={milestonesHit} />
        </View>
      </View>

      {/* Tab bar */}
      <PlaybookTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'today' && (
        <TodayView
          todayTask={todayTask}
          currentDay={currentDay}
          currentWeek={currentWeek}
          completedToday={completedToday}
          onMarkDone={onMarkDone}
          hustleTitle={hustle.title}
          playbook={playbook}
          personalized={personalized}
          personalizing={personalizing}
        />
      )}

      {activeTab === 'plan' && (
        <PlanView playbook={playbook} completedDayIds={completedDayIds} currentWeek={currentWeek} />
      )}

      {activeTab === 'coach' && (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <CoachChat hustleId={hustle.id} hustleName={hustle.title} week={currentWeek} day={currentDay} />
        </ScrollView>
      )}

      {activeTab === 'more' && (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Animated.Text
          entering={FadeIn.duration(380)}
          style={{ marginTop: 8, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13, lineHeight: 19 }}
        >
          {hustle.tagline}
        </Animated.Text>

        {/* AI-personalized intro card */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(420)}
          style={{
            marginTop: 16, padding: 16, borderRadius: 14,
            backgroundColor: HA.limeSoft, borderWidth: 1.5, borderColor: HA.strokeLime,
          }}
        >
          <Row gap={8} style={{ marginBottom: 8 }}>
            <View style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: HA.lime, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: HA.bgDeep, fontFamily: FONT.displayHeavy, fontSize: 11 }}>AI</Text>
            </View>
            <MonoLabel color={HA.lime}>FROM YOUR COACH</MonoLabel>
          </Row>
          {personalizing ? (
            <Row gap={8}>
              <ActivityIndicator color={HA.lime} size="small" />
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13 }}>Reading your answers…</Text>
            </Row>
          ) : (
            <Text style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 21 }}>
              {personalized?.intro}
            </Text>
          )}
        </Animated.View>

        {/* Hero / thesis */}
        <SectionHeader label="THE THESIS" title="Why this niche, why now" delay={300} />
        <Animated.View
          entering={FadeInUp.delay(360).duration(380)}
          style={{ padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke, marginTop: 10 }}
        >
          <Text style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 21 }}>
            {playbook.hero.thesis}
          </Text>
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: HA.stroke, gap: 6 }}>
            <Row gap={8}>
              <MonoLabel color={HA.lime}>MARKET</MonoLabel>
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>{playbook.hero.marketSize}</Text>
            </Row>
            <Row gap={8}>
              <MonoLabel color={HA.lime}>EVIDENCE</MonoLabel>
              <Text style={{ flex: 1, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>{playbook.hero.payingEvidence}</Text>
            </Row>
          </View>
        </Animated.View>

        {/* 12-week plan */}
        <SectionHeader label="QUARTER 01" title="Your 12-week plan" delay={420} />
        <Stack gap={10} style={{ marginTop: 10 }}>
          {playbook.ninetyDay.map((w, i) => (
            <Animated.View key={w.week} entering={FadeInUp.delay(480 + i * 30).duration(320)}>
              <WeekCard week={w} />
            </Animated.View>
          ))}
        </Stack>

        {/* First 10 customers */}
        <SectionHeader label="YOUR FIRST 10" title="How to find them" delay={520} />
        <Animated.View
          entering={FadeInUp.delay(580).duration(380)}
          style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}
        >
          <MonoLabel color={HA.lime}>CHANNELS</MonoLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {playbook.firstTenCustomers.channels.map((c) => (
              <Tag key={c} color={HA.ink} bg={HA.bgDeep}>{c}</Tag>
            ))}
          </View>
          <Text style={{ marginTop: 14, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13 }}>
            <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>Cadence: </Text>
            {playbook.firstTenCustomers.cadence}
          </Text>
          <View style={{ marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke }}>
            <MonoLabel>THE SCRIPT</MonoLabel>
            <Text style={{ marginTop: 8, color: HA.ink, fontFamily: FONT.mono, fontSize: 12, lineHeight: 18 }}>
              {playbook.firstTenCustomers.script}
            </Text>
          </View>
        </Animated.View>

        {/* AI personalized scripts */}
        {personalized && personalized.scripts.length > 0 ? (
          <>
            <SectionHeader label="SCRIPTS" title="Your 3 personalized outreach templates" delay={620} />
            <Stack gap={10} style={{ marginTop: 10 }}>
              {personalized.scripts.map((s, i) => (
                <Animated.View
                  key={i}
                  entering={FadeInUp.delay(680 + i * 60).duration(380)}
                  style={{ padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.strokeLime }}
                >
                  <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime} style={{ alignSelf: 'flex-start' }}>{s.label}</Tag>
                  <View style={{ marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: HA.bgDeep }}>
                    <Text style={{ color: HA.ink, fontFamily: FONT.mono, fontSize: 11.5, lineHeight: 18 }}>{s.body}</Text>
                  </View>
                </Animated.View>
              ))}
            </Stack>
          </>
        ) : null}

        {/* Tool stack */}
        <SectionHeader label="GEAR" title="Your tool stack" delay={720} />
        <Stack gap={8} style={{ marginTop: 10 }}>
          {playbook.toolStack.map((t, i) => (
            <Animated.View key={t.name} entering={FadeInUp.delay(780 + i * 40).duration(320)}>
              <View style={{
                padding: 12, borderRadius: 12, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke,
                flexDirection: 'row', alignItems: 'center', gap: 10,
              }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 9, backgroundColor: HA.bgDeep,
                  borderWidth: 1, borderColor: HA.stroke,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: HA.lime, fontFamily: FONT.displayHeavy, fontSize: 13, letterSpacing: -0.4 }}>
                    {t.name.slice(0, 2).toLowerCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Row gap={8}>
                    <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>{t.name}</Text>
                    <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10 }}>{t.pricing}</Text>
                  </Row>
                  <Text style={{ marginTop: 2, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>{t.why}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Stack>

        {/* Pricing */}
        <SectionHeader label="$$$" title="Pricing playbook" delay={860} />
        <Stack gap={10} style={{ marginTop: 10 }}>
          {[
            { tier: 'Starter', body: playbook.pricing.starter },
            { tier: 'Growth', body: playbook.pricing.growth },
            { tier: 'Premium', body: playbook.pricing.premium },
          ].map((p, i) => (
            <Animated.View key={p.tier} entering={FadeInUp.delay(920 + i * 50).duration(320)}>
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
                <MonoLabel color={HA.lime}>{p.tier}</MonoLabel>
                <Text style={{ marginTop: 4, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>{p.body}</Text>
              </View>
            </Animated.View>
          ))}
        </Stack>
        <View style={{
          marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.strokeLime,
        }}>
          <MonoLabel color={HA.lime}>WHEN TO RAISE</MonoLabel>
          <Text style={{ marginTop: 4, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>{playbook.pricing.raisingRules}</Text>
        </View>

        {/* Failure modes */}
        <SectionHeader label="WARNING" title="Common ways this fails" delay={1000} />
        <Stack gap={8} style={{ marginTop: 10 }}>
          {playbook.failureModes.map((f, i) => (
            <Animated.View key={i} entering={FadeInUp.delay(1060 + i * 35).duration(280)}>
              <View style={{
                padding: 10, borderRadius: 10, backgroundColor: HA.coralSoft,
                borderWidth: 1, borderColor: 'rgba(255,92,57,0.25)', flexDirection: 'row', gap: 10,
              }}>
                <View style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: HA.coral, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: FONT.monoBold, fontSize: 11 }}>!</Text>
                </View>
                <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>{f}</Text>
              </View>
            </Animated.View>
          ))}
        </Stack>

        {/* Real launches */}
        <SectionHeader label="PROOF" title="Real comparable launches" delay={1180} />
        <Stack gap={10} style={{ marginTop: 10 }}>
          {playbook.realLaunches.map((l, i) => (
            <Animated.View key={i} entering={FadeInUp.delay(1240 + i * 60).duration(320)}>
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
                <Row justify="space-between">
                  <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>{l.name}</Text>
                  <Text style={{ color: HA.lime, fontFamily: FONT.monoBold, fontSize: 12 }}>{l.mrr}/mo</Text>
                </Row>
                <Text style={{ marginTop: 4, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>
                  by <Text style={{ color: HA.ink }}>{l.operator}</Text> · hit it at month {l.months} via {l.channels.join(', ')}
                </Text>
              </View>
            </Animated.View>
          ))}
        </Stack>

        {/* Setup */}
        <SectionHeader label="BUSINESS" title="Setup" delay={1400} />
        <Animated.View
          entering={FadeInUp.delay(1460).duration(360)}
          style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke, gap: 10 }}
        >
          <SetupRow label="LLC" body={playbook.setup.llc} />
          <SetupRow label="Payments" body={playbook.setup.payments} />
          <SetupRow label="Contracts" body={playbook.setup.contracts} />
          {playbook.setup.insurance ? <SetupRow label="Insurance" body={playbook.setup.insurance} /> : null}
        </Animated.View>

        {/* Scaling */}
        <SectionHeader label="LATER" title="Scaling beyond solo" delay={1520} />
        <Animated.View
          entering={FadeInUp.delay(1580).duration(360)}
          style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}
        >
          <Text style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 20 }}>
            {playbook.scaling}
          </Text>
        </Animated.View>

        {/* Actions */}
        <View style={{ marginTop: 24, gap: 10 }}>
          <CTA onPress={onExport} disabled={!personalized || exporting} hapticKind="tapMed">
            {exporting ? <ActivityIndicator color={HA.bgDeep} /> : <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 17 }}>📄 Export full PDF</Text>}
          </CTA>
          <CTAOutline onPress={onBack}>Back to matches</CTAOutline>
        </View>
      </ScrollView>
      )}

      {/* Modals */}
      <WeekMilestoneCard
        visible={milestoneShown !== null}
        week={milestoneShown ?? 0}
        hustleTitle={hustle.title}
        rewardLabel="Next-week script unlocked"
        onClose={() => setMilestoneShown(null)}
      />
      <PauseSheet
        visible={pauseOpen}
        pausesUsed={progress?.pausesUsed ?? 0}
        onPause={(hours) => pausePlaybook(hustle.slug, hours)}
        onClose={() => setPauseOpen(false)}
      />
    </Screen>
  );
}

// ── TodayView — focused single-task surface ──────────────────────────
function TodayView({
  todayTask,
  currentDay,
  currentWeek,
  completedToday,
  onMarkDone,
  hustleTitle,
  playbook,
  personalized,
  personalizing,
}: {
  todayTask: { title: string; description: string; successCriteria: string; minutes: number } | null;
  currentDay: number;
  currentWeek: number;
  completedToday: boolean;
  onMarkDone: () => void;
  hustleTitle: string;
  playbook: Playbook;
  personalized: PersonalizedLayer | null;
  personalizing: boolean;
}) {
  const week = playbook.ninetyDay.find((w) => w.week === currentWeek);
  const metricLabel = week
    ? (typeof week.metric === 'string' ? week.metric : (week.metric as { label: string }).label)
    : null;
  const nextMilestoneWeek = [4, 8, 12].find((w) => w >= currentWeek);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 14 }}>
      {/* AI personalized intro (compact in Today view) */}
      {personalized?.intro && !personalizing ? (
        <View style={{ marginTop: 4, padding: 12, borderRadius: RADIUS.card, backgroundColor: HA.limeSoft, borderWidth: 1, borderColor: HA.strokeLime }}>
          <MonoLabel color={HA.lime}>FROM YOUR COACH</MonoLabel>
          <Text style={{ marginTop: 6, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 19 }}>
            {personalized.intro}
          </Text>
        </View>
      ) : null}

      {/* The Hero: today's task */}
      {todayTask ? (
        <TodayTaskCard
          dayNumber={currentDay}
          title={todayTask.title}
          minutes={todayTask.minutes}
          description={todayTask.description}
          successCriteria={todayTask.successCriteria}
          done={completedToday}
          onMarkDone={onMarkDone}
        />
      ) : (
        <View style={{ padding: 16, borderRadius: RADIUS.card, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13 }}>
            No task scheduled for today. Rest day. Streak still alive.
          </Text>
        </View>
      )}

      {/* This week's metric */}
      {metricLabel ? (
        <View style={{ padding: 14, borderRadius: RADIUS.card, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          <MonoLabel color={HA.inkSoft}>THIS WEEK'S METRIC</MonoLabel>
          <Text style={{ marginTop: 6, color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15 }}>
            {metricLabel}
          </Text>
        </View>
      ) : null}

      {/* Next milestone preview */}
      {nextMilestoneWeek ? (
        <View style={{ padding: 14, borderRadius: RADIUS.card, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.strokeLime }}>
          <MonoLabel color={HA.lime}>NEXT MILESTONE</MonoLabel>
          <Text style={{ marginTop: 6, color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>
            Week {nextMilestoneWeek} complete
          </Text>
          <Text style={{ marginTop: 4, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>
            Finish all of week {nextMilestoneWeek} to unlock a new script + badge.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

// ── PlanView — full 12-week vertical list with checkable days ────────
function PlanView({ playbook, completedDayIds, currentWeek }: { playbook: Playbook; completedDayIds: number[]; currentWeek: number }) {
  const completedSet = useMemo(() => new Set(completedDayIds), [completedDayIds]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
      {playbook.ninetyDay.map((w) => {
        const weekStart = (w.week - 1) * 7 + 1;
        const days = w.days ?? [];
        const actions = w.actions ?? [];
        const isCurrent = w.week === currentWeek;
        const metricLabel = typeof w.metric === 'string' ? w.metric : (w.metric as { label: string }).label;
        return (
          <View
            key={w.week}
            style={{
              padding: 14,
              borderRadius: RADIUS.card,
              backgroundColor: HA.surface,
              borderWidth: 1,
              borderColor: isCurrent ? HA.strokeLime : HA.stroke,
            }}
          >
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <MonoLabel color={isCurrent ? HA.lime : HA.inkSoft}>WEEK {w.week.toString().padStart(2, '0')}</MonoLabel>
              <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 13 }}>{w.title}</Text>
            </Row>
            <View style={{ gap: 6 }}>
              {(days.length ? days : actions).map((item, i) => {
                const dayNumber = (days.length ? (item as PlaybookDay).dayNumber : weekStart + i);
                const label = days.length ? (item as PlaybookDay).title : (item as { action: string }).action;
                const minutes = (item as { minutes: number }).minutes;
                const done = completedSet.has(dayNumber);
                return (
                  <View key={dayNumber} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6, alignItems: 'flex-start' }}>
                    <View style={{
                      marginTop: 2, width: 16, height: 16, borderRadius: 99,
                      backgroundColor: done ? HA.lime : 'transparent',
                      borderWidth: done ? 0 : 1.5, borderColor: HA.strokeBold,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done ? <Text style={{ color: HA.bgDeep, fontSize: 10, fontFamily: FONT.bodyBold }}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18, textDecorationLine: done ? 'line-through' : 'none' }}>
                        Day {dayNumber}. {label}
                      </Text>
                      <Text style={{ marginTop: 2, color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10 }}>
                        {minutes} min
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: HA.stroke }}>
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, lineHeight: 17 }}>
                <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>Metric: </Text>{metricLabel}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function WeekCard({ week }: { week: Playbook['ninetyDay'][number] }) {
  return (
    <View style={{ padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <MonoLabel color={HA.lime}>WEEK {week.week.toString().padStart(2, '0')}</MonoLabel>
        <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>{week.title}</Text>
      </Row>
      <View style={{ gap: 8 }}>
        {(week.actions ?? []).map((a, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: HA.stroke, paddingTop: i === 0 ? 0 : 10 }}>
            <View style={{ width: 38 }}>
              <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.6 }}>{(a.day || '·').toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>{a.action}</Text>
              <Row gap={6} style={{ marginTop: 3 }}>
                <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10 }}>✓ {a.success}</Text>
                <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10 }}>· {a.minutes} min</Text>
              </Row>
            </View>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: HA.stroke }}>
        <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, lineHeight: 17 }}>
          <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>Metric: </Text>{typeof week.metric === 'string' ? week.metric : week.metric.label}
        </Text>
      </View>
    </View>
  );
}

function SetupRow({ label, body }: { label: string; body: string }) {
  return (
    <View>
      <MonoLabel color={HA.lime}>{label}</MonoLabel>
      <Text style={{ marginTop: 4, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 19 }}>{body}</Text>
    </View>
  );
}

function SectionHeader({ label, title, delay = 0 }: { label: string; title: string; delay?: number }) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(380)} style={{ marginTop: 22 }}>
      <MonoLabel color={HA.lime}>{label}</MonoLabel>
      <Text style={{ marginTop: 4, fontFamily: FONT.displayHeavy, fontSize: 22, color: HA.ink, letterSpacing: -0.8 }}>{title}</Text>
    </Animated.View>
  );
}
