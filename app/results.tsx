import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar, ConfidenceBand, WhyBulletView } from '~/components/screen';
import { Row, Stack, Tag, Dot, Sticker, MonoLabel, Icon } from '~/components/atoms';
import { CountUp } from '~/components/count-up';
import { useApp } from '~/lib/store';
import { topMatches, profileSummary, ScoredMatch } from '~/lib/score';
import { Hustle } from '~/lib/hustles';
import { haptic } from '~/hooks/useHaptic';

export default function ResultsScreen() {
  const router = useRouter();
  const answers = useApp((s) => s.answers);
  const { matches } = useMemo(() => topMatches(answers, 3), [answers]);
  const profile = useMemo(() => profileSummary(answers), [answers]);

  useEffect(() => {
    // Celebratory haptic on mount
    haptic.success();
  }, []);

  if (matches.length === 0) {
    return (
      <Screen>
        <TopBar onBack={() => router.replace('/')} label="No matches" />
        <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 24, color: HA.ink }}>No matches passed your filters.</Text>
          <Text style={{ color: HA.inkMuted, fontFamily: FONT.body }}>
            Try retaking the quiz with more hours / fewer blockers.
          </Text>
          <Pressable onPress={() => router.replace('/')}>
            <Text style={{ color: HA.lime, fontFamily: FONT.bodyBold, marginTop: 16 }}>Start over →</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar
        onBack={() => router.replace('/')}
        label="Your matches"
        right={<Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
          {Icon.spark(HA.lime, 11)}
          <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, marginLeft: 4, letterSpacing: 1 }}>
            7s
          </Text>
        </Tag>}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile summary callout */}
        <Animated.View
          entering={FadeIn.delay(80).duration(380)}
          style={{
            padding: 14, borderRadius: 14, backgroundColor: HA.surface,
            borderWidth: 1, borderColor: HA.stroke, marginBottom: 14,
          }}
        >
          <MonoLabel color={HA.lime}>YOUR PROFILE</MonoLabel>
          <Text style={{ marginTop: 8, color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
            You're <Text style={{ color: HA.lime, fontFamily: FONT.bodyBold }}>{profile.topRiasec[0]?.label}-leaning</Text>
            {profile.topRiasec[1] ? <> · <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>{profile.topRiasec[1].label}</Text> secondary</> : null}
            {profile.goalReadout ? <>{'\n'}<Text style={{ color: HA.inkMuted }}>{profile.goalReadout}.</Text></> : null}
          </Text>
        </Animated.View>

        {/* Confidence band */}
        <Animated.View entering={FadeIn.delay(220).duration(380)}>
          <ConfidenceBand
            confidence={profile.confidence}
            captured={profile.signalsCaptured}
            total={profile.totalSignals}
            pulse={profile.confidence === 'high'}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(360).duration(380)}
          style={{
            marginTop: 18, fontFamily: FONT.displayHeavy, fontSize: 32, color: HA.ink,
            letterSpacing: -1.4, lineHeight: 36,
          }}
        >
          Your <Text style={{ color: HA.lime }}>3</Text> unfair matches.
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(450).duration(380)}
          style={{ marginTop: 6, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13 }}
        >
          Sorted by fit. Tap #1 for the playbook.
        </Animated.Text>

        <Stack gap={12} style={{ marginTop: 16 }}>
          {matches.map((m, i) => (
            <Animated.View
              key={m.hustle.id}
              entering={FadeInUp.delay(560 + i * 160).duration(420).springify()}
            >
              <MatchCard m={m} rank={i + 1} onPress={() => router.push(`/playbook/${m.hustle.slug}` as any)} />
            </Animated.View>
          ))}
        </Stack>

        <Animated.View entering={FadeIn.delay(1300).duration(380)}>
          <Pressable onPress={() => router.push('/(app)/methodology' as any)} style={{ marginTop: 18 }}>
            <Row gap={6} justify="center">
              {Icon.lock(HA.inkSoft, 11)}
              <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 12, textDecorationLine: 'underline' }}>
                How we calculate this
              </Text>
            </Row>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function MatchCard({ m, rank, onPress }: { m: ScoredMatch; rank: number; onPress: () => void }) {
  const top = rank === 1;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      { borderRadius: 18, opacity: pressed ? 0.95 : 1 },
    ]}>
      <View style={{
        padding: 16, borderRadius: 18,
        backgroundColor: HA.surface, borderWidth: top ? 1.5 : 1,
        borderColor: top ? HA.strokeLime : HA.stroke,
        shadowColor: top ? HA.lime : 'transparent', shadowOpacity: top ? 0.18 : 0, shadowRadius: 18,
        position: 'relative',
      }}>
        {top ? <View style={{ position: 'absolute', top: -8, right: 14 }}>
          <Sticker rotate={6} style={{ position: 'relative' }}>TOP MATCH</Sticker>
        </View> : null}

        <Row justify="space-between" align="flex-start" style={{ marginTop: top ? 6 : 0 }}>
          <Row gap={8}>
            <View style={{
              width: 26, height: 26, borderRadius: 8,
              backgroundColor: top ? HA.lime : HA.surfaceHi,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: top ? 0 : 1, borderColor: HA.stroke,
            }}>
              <Text style={{ color: top ? HA.bgDeep : HA.inkMuted, fontFamily: FONT.monoBold, fontSize: 12 }}>{rank}</Text>
            </View>
            <Tag>{m.hustle.accent.toUpperCase()}</Tag>
          </Row>
          <View style={{ alignItems: 'flex-end' }}>
            <Row gap={2} align="flex-end">
              <CountUp
                to={m.score}
                duration={760}
                delay={top ? 700 : 700 + (rank - 1) * 160}
                style={{
                  fontFamily: FONT.displayHeavy, fontSize: 28, color: top ? HA.lime : HA.ink,
                  letterSpacing: -1, lineHeight: 28,
                }}
              />
              <Text style={{ fontSize: 13, color: HA.inkMuted, fontFamily: FONT.bodyMed }}>%</Text>
            </Row>
            <MonoLabel>FIT</MonoLabel>
          </View>
        </Row>

        <Text style={{
          marginTop: 14, fontFamily: FONT.displayHeavy, fontSize: 22, lineHeight: 26,
          letterSpacing: -0.6, color: HA.ink,
        }}>
          {m.hustle.title}
        </Text>

        <View style={{
          marginTop: 12, padding: 12, borderRadius: 12,
          backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke,
          flexDirection: 'row', justifyContent: 'space-between',
        }}>
          <Stat label="MONTHLY" value={m.hustle.monthly} accent={HA.lime} />
          <Stat label="START" value={m.hustle.startup} />
          <Stat label="1st $" value={m.hustle.firstDollar} />
        </View>

        <View style={{ marginTop: 12, gap: 8 }}>
          {m.why.slice(0, top ? 4 : 3).map((w, idx) => (
            <WhyBulletView key={idx} text={w.text} negative={w.negative} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={{ flexShrink: 1 }}>
      <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: HA.inkSoft, letterSpacing: 1 }}>{label}</Text>
      <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 17, color: accent || HA.ink, marginTop: 3, letterSpacing: -0.5 }}>{value}</Text>
    </View>
  );
}
