import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
  FadeIn,
} from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Tag, Dot, MonoLabel } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { buildUserVector } from '~/lib/score';
import { RIASEC_DIMS, DIM_NAMES } from '~/lib/dimensions';

const STAGES = [
  { label: 'Building 17-axis user vector…', duration: 600 },
  { label: 'Filtering by hours + budget…',   duration: 520 },
  { label: 'Cosine match vs RIASEC…',        duration: 560 },
  { label: 'Personality alignment + goal…',  duration: 540 },
  { label: 'Generating explanations…',       duration: 540 },
];

const FILTER_TICKS = [30, 24, 17, 11, 6, 3];

export default function ThinkingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [filterIdx, setFilterIdx] = useState(0);
  const answers = useApp((s) => s.answers);

  const riasecCode = useMemo(() => {
    const u = buildUserVector(answers);
    const codes = RIASEC_DIMS
      .map((i) => ({ i, v: u.vec[i], char: (DIM_NAMES[i] || 'X')[0] }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 3)
      .map((x) => x.char)
      .join('');
    return codes;
  }, [answers]);

  // Step progression
  useEffect(() => {
    if (step >= STAGES.length) {
      const t = setTimeout(() => router.replace('/results'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STAGES[step]?.duration ?? 500);
    return () => clearTimeout(t);
  }, [step, router]);

  // Filter ticker — tick down 30 → 3 over the same time as the stages
  useEffect(() => {
    if (filterIdx >= FILTER_TICKS.length - 1) return;
    const total = STAGES.reduce((a, s) => a + s.duration, 0);
    const each = total / (FILTER_TICKS.length - 1);
    const t = setTimeout(() => setFilterIdx((s) => s + 1), each);
    return () => clearTimeout(t);
  }, [filterIdx]);

  return (
    <Screen bg={HA.bgDeep}>
      <TopBar
        label={<MonoLabel color={HA.inkMuted}>ANALYZING</MonoLabel>}
        right={<Tag color={HA.lime} border={HA.strokeLime}>
          <Dot size={5} color={HA.lime} />
          <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, marginLeft: 4 }}>LIVE</Text>
        </Tag>}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <Orb />

        <Animated.Text
          entering={FadeIn.duration(380)}
          style={{
            fontFamily: FONT.displayHeavy, fontSize: 26, lineHeight: 30, letterSpacing: -1,
            color: HA.ink, textAlign: 'center', maxWidth: 320,
          }}
        >
          Your code:{'\n'}
          <Text style={{ color: HA.lime, fontSize: 40, letterSpacing: -2 }}>{riasecCode || '. . .'}</Text>
        </Animated.Text>

        {/* Live filter ticker */}
        <Animated.View
          entering={FadeIn.delay(200).duration(360)}
          style={{
            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
            backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.strokeLime,
            flexDirection: 'row', alignItems: 'center', gap: 10,
          }}
        >
          <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: HA.inkMuted, letterSpacing: 1 }}>
            HUSTLES REMAINING:
          </Text>
          <Text style={{
            fontFamily: FONT.displayHeavy, fontSize: 24, color: HA.lime, letterSpacing: -0.5, minWidth: 36, textAlign: 'right',
          }}>
            {FILTER_TICKS[filterIdx]}
          </Text>
        </Animated.View>

        {/* Stages list */}
        <View style={{ width: '100%', padding: 16, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          {STAGES.map((line, i) => {
            const done = i < step;
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6, alignItems: 'center', opacity: done || i === step ? 1 : 0.3 }}>
                <View style={{
                  width: 16, height: 16, borderRadius: 99,
                  backgroundColor: done ? HA.lime : 'transparent',
                  borderWidth: done ? 0 : 1.5, borderColor: HA.strokeBold,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {done ? <Text style={{ color: HA.bgDeep, fontSize: 10, fontFamily: FONT.bodyBold }}>✓</Text> : null}
                </View>
                <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.mono, fontSize: 12, letterSpacing: 0.2 }}>
                  {line.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function Orb() {
  const rot = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
    bob.value = withRepeat(
      withSequence(withTiming(-3, { duration: 1200 }), withTiming(0, { duration: 1200 })),
      -1, true,
    );
  }, []);

  const innerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const wrapStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <Animated.View style={[styles.orbWrap, wrapStyle]}>
      <View style={styles.orbBase} />
      <Animated.View style={[styles.orbShine, innerStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orbWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  orbBase: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: HA.lime,
    shadowColor: HA.lime, shadowOpacity: 0.6, shadowRadius: 40, shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  orbShine: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.55)', opacity: 0.5, top: 20, left: 30,
  },
});
