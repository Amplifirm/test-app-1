import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Screen, CTADock, TopBar } from '~/components/screen';
import { CTA, Row, Tag, Icon, MonoLabel } from '~/components/atoms';

const FRAMEWORKS = [
  { id: 'riasec', label: 'RIASEC', sub: 'Holland career codes — 60 years of validation', axes: 6, color: HA.lime },
  { id: 'big5',   label: 'Big Five (subset)', sub: 'Conscientiousness · Extraversion · Openness', axes: 3, color: HA.coral },
  { id: 'jtbd',   label: 'Jobs-to-be-Done', sub: 'What outcome do you actually want?', axes: 8, color: '#4D7EEE' },
  { id: 'filter', label: 'Hard filters', sub: 'Hours, budget, what you won\'t do', axes: 4, color: '#B14DEE' },
];

export default function OnboardingIntro() {
  const router = useRouter();

  return (
    <Screen>
      <TopBar
        onBack={() => router.back()}
        label={<MonoLabel color={HA.lime}>SETUP</MonoLabel>}
        right={<Tag>1 / 2</Tag>}
      />

      <View style={{ flex: 1 }}>
        <Animated.Text
          entering={FadeInUp.delay(80).duration(420)}
          style={{ fontFamily: FONT.displayHeavy, fontSize: 38, color: HA.ink, letterSpacing: -1.8, lineHeight: 40 }}
        >
          We don't guess.{'\n'}We <Text style={{ color: HA.lime }}>measure</Text>.
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(280).duration(420)}
          style={{ marginTop: 14, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 15, lineHeight: 22 }}
        >
          17 signals. 4 validated frameworks. 30 hand-curated hustles. One unfair match.
        </Animated.Text>

        <View style={{ marginTop: 28, gap: 12 }}>
          {FRAMEWORKS.map((f, i) => (
            <Animated.View
              key={f.id}
              entering={FadeInUp.delay(380 + i * 90).duration(380)}
              style={{
                padding: 14, borderRadius: 14,
                backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke,
              }}
            >
              <Row justify="space-between">
                <Row gap={10}>
                  <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: f.color }} />
                  <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15 }}>{f.label}</Text>
                </Row>
                <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 11 }}>
                  {f.axes} {f.axes === 1 ? 'axis' : 'axes'}
                </Text>
              </Row>
              <Text style={{ marginTop: 6, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>
                {f.sub}
              </Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeIn.delay(820).duration(380)}
          style={{
            marginTop: 18, padding: 12, borderRadius: 12,
            backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke,
            flexDirection: 'row', gap: 10,
          }}
        >
          {Icon.lock(HA.lime)}
          <Text style={{ flex: 1, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, lineHeight: 17 }}>
            All answers stay on your device. No signup, no email, nothing leaves until you choose to unlock.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(900).duration(380)}>
        <CTADock padH={0}>
          <CTA onPress={() => router.push('/onboarding/calibrate' as any)} hapticKind="tapMed">
            <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 17 }}>
              I'm ready
            </Text>
            {Icon.arrow(HA.bgDeep)}
          </CTA>
        </CTADock>
      </Animated.View>
    </Screen>
  );
}
