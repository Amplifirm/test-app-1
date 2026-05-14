import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Tag, Dot, MonoLabel } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { buildUserVector } from '~/lib/score';
import { DIM, DIM_NAMES, RIASEC_DIMS } from '~/lib/dimensions';

export default function Checkpoint1() {
  const router = useRouter();
  const answers = useApp((s) => s.answers);

  // Compute top 2 RIASEC axes from current state
  const { topAxes } = useMemo(() => {
    const u = buildUserVector(answers);
    const sorted = RIASEC_DIMS
      .map((i) => ({ dim: i, value: u.vec[i] - 50, label: DIM_NAMES[i] }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 2);
    return { topAxes: sorted };
  }, [answers]);

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(quiz)/q5-payment'), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen>
      <TopBar
        label={<MonoLabel color={HA.lime}>CHECKPOINT</MonoLabel>}
        right={<PulseTag />}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.Text entering={FadeIn.duration(280)} style={{ fontFamily: FONT.mono, fontSize: 11, color: HA.inkSoft, letterSpacing: 1.4 }}>
          STAGE 1 / 3 · LOCKING IN
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(120).duration(360)}
          style={{ marginTop: 8, fontFamily: FONT.displayHeavy, fontSize: 30, color: HA.ink, letterSpacing: -1.2, lineHeight: 34 }}
        >
          Locking in your{'\n'}
          <Text style={{ color: HA.lime }}>RIASEC code…</Text>
        </Animated.Text>

        <View style={{ marginTop: 30, gap: 10 }}>
          {topAxes.map((a, i) => (
            <Animated.View
              key={a.dim}
              entering={FadeInUp.delay(300 + i * 180).duration(380)}
              style={{
                padding: 14, borderRadius: 14,
                backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.strokeLime,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 17 }}>{a.label}</Text>
                <Text style={{ color: a.value >= 0 ? HA.lime : HA.coral, fontFamily: FONT.monoBold, fontSize: 15 }}>
                  {a.value >= 0 ? '+' : ''}{a.value.toFixed(0)}
                </Text>
              </View>
              {/* progress bar */}
              <View style={{ marginTop: 8, height: 4, borderRadius: 99, backgroundColor: HA.bgDeep, overflow: 'hidden' }}>
                <View style={{
                  height: 4, borderRadius: 99,
                  width: `${Math.min(100, Math.abs(a.value) * 2)}%`,
                  backgroundColor: a.value >= 0 ? HA.lime : HA.coral,
                }} />
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.Text
          entering={FadeIn.delay(900).duration(380)}
          style={{ marginTop: 22, fontFamily: FONT.mono, fontSize: 11, color: HA.inkMuted, letterSpacing: 1.2 }}
        >
          ↳ 6 more signals needed for full code
        </Animated.Text>
      </View>
    </Screen>
  );
}

function PulseTag() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 600 })), -1, true);
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={s}>
      <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
        <Dot size={5} color={HA.lime} />
        <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, marginLeft: 4 }}>COMPUTING</Text>
      </Tag>
    </Animated.View>
  );
}
