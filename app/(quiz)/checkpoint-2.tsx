import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Tag, Dot, MonoLabel } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { profileSummary } from '~/lib/score';

export default function Checkpoint2() {
  const router = useRouter();
  const answers = useApp((s) => s.answers);

  const profile = useMemo(() => profileSummary(answers), [answers]);

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(quiz)/q9-commit'), 1700);
    return () => clearTimeout(t);
  }, []);

  // Split goalReadout into pills if it's long
  const goalParts = profile.goalReadout.split(', ').filter(Boolean);

  return (
    <Screen>
      <TopBar
        label={<MonoLabel color={HA.lime}>CHECKPOINT</MonoLabel>}
        right={<PulseTag />}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.Text entering={FadeIn.duration(280)} style={{ fontFamily: FONT.mono, fontSize: 11, color: HA.inkSoft, letterSpacing: 1.4 }}>
          STAGE 2 / 3 · GOAL VECTOR
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(120).duration(360)}
          style={{ marginTop: 8, fontFamily: FONT.displayHeavy, fontSize: 30, color: HA.ink, letterSpacing: -1.2, lineHeight: 34 }}
        >
          Your goal vector{'\n'}
          <Text style={{ color: HA.lime }}>is taking shape…</Text>
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(280).duration(420)}
          style={{
            marginTop: 24, padding: 16, borderRadius: 14,
            backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.strokeLime,
          }}
        >
          <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.4 }}>READING</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {goalParts.length === 0 ? (
              <Text style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 14 }}>still calibrating…</Text>
            ) : goalParts.map((p, i) => (
              <Animated.View key={p} entering={FadeIn.delay(400 + i * 120).duration(380)}>
                <View style={{
                  paddingVertical: 6, paddingHorizontal: 11, borderRadius: 99,
                  backgroundColor: HA.limeSoft, borderWidth: 1, borderColor: HA.strokeLime,
                }}>
                  <Text style={{ color: HA.lime, fontFamily: FONT.bodyBold, fontSize: 13 }}>{p}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(1000).duration(380)}
          style={{ marginTop: 18, fontFamily: FONT.mono, fontSize: 11, color: HA.inkMuted, letterSpacing: 1.2 }}
        >
          ↳ 2 more for hard filters · hours, budget
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
