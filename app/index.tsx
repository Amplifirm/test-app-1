import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn, FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Screen, CTADock, TopBar } from '~/components/screen';
import { CTA, Row, Tag, Dot, Icon, Sticker } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { shouldShowIntro } from '~/lib/intro-state';

export default function HeroScreen() {
  const router = useRouter();
  const resetQuiz = useApp((s) => s.resetQuiz);
  const [introChecked, setIntroChecked] = useState(false);

  useEffect(() => {
    if (shouldShowIntro()) {
      router.replace('/intro' as any);
    } else {
      setIntroChecked(true);
    }
  }, []);

  // While the intro is taking over the screen, render nothing to avoid a
  // single-frame flash of the hero.
  if (!introChecked && shouldShowIntro()) return null;

  const start = () => {
    resetQuiz();
    router.push('/onboarding/intro' as any);
  };

  return (
    <Screen>
      <TopBar
        label={
          <Row gap={6}>
            <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 15, color: HA.ink, letterSpacing: -0.3 }}>
              HUSTLE<Text style={{ color: HA.lime }}>AI</Text>
            </Text>
          </Row>
        }
        right={<LivePulse />}
      />

      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          {/* Influencer credit pill */}
          <Animated.View
            entering={FadeIn.delay(80).duration(420)}
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row', alignItems: 'center', gap: 8,
              paddingVertical: 6, paddingLeft: 6, paddingRight: 12,
              borderRadius: 99, marginBottom: 18,
              backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke,
            }}
          >
            <View style={{
              width: 22, height: 22, borderRadius: 99,
              backgroundColor: '#FFB627', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: HA.bgDeep, fontFamily: FONT.displayHeavy, fontSize: 11 }}>M</Text>
            </View>
            <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>
              from <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>@mattgray</Text> · 2.4M views
            </Text>
          </Animated.View>

          {/* Headline — line by line */}
          <View style={{ position: 'relative' }}>
            <Animated.Text
              entering={FadeInUp.delay(150).duration(480)}
              style={{
                fontFamily: FONT.displayHeavy, fontSize: 56,
                color: HA.ink, letterSpacing: -2.4, lineHeight: 52,
              }}
            >
              Find your
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(300).duration(480)}
              style={{
                fontFamily: FONT.displayHeavy, fontSize: 56,
                color: HA.lime, letterSpacing: -2.4, lineHeight: 52,
              }}
            >
              unfair
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(450).duration(480)}
              style={{
                fontFamily: FONT.displayHeavy, fontSize: 56,
                color: HA.ink, letterSpacing: -2.4, lineHeight: 52,
              }}
            >
              side hustle.
            </Animated.Text>
            <Animated.View entering={FadeIn.delay(600).duration(380)} style={{ position: 'absolute', top: -6, right: -4 }}>
              <Sticker rotate={8} color={HA.coral} fg="#fff" style={{ position: 'relative' }}>NEW</Sticker>
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeIn.delay(700).duration(420)}
            style={{
              marginTop: 18, fontSize: 15, color: HA.inkMuted, lineHeight: 21,
              fontFamily: FONT.body,
            }}
          >
            A 60-second quiz scores you on <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>17 signals</Text> and matches you to one of <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>30 hustles</Text> you could start <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>this weekend</Text>.
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(820).duration(400)}>
            <Row gap={6} wrap style={{ marginTop: 20 }}>
              <Tag>17 SIGNALS</Tag>
              <Tag>30 HUSTLES</Tag>
              <Tag>RIASEC + BIG FIVE</Tag>
            </Row>
          </Animated.View>
        </View>

        {/* Social proof */}
        <Animated.View entering={FadeInUp.delay(950).duration(420)}>
          <Row gap={12} style={{ marginBottom: 8 }}>
            <Row gap={0}>
              {[
                { i: 'MK', c: '#FFB627' },
                { i: 'AT', c: '#FF5C39' },
                { i: 'JS', c: HA.lime, fg: HA.bgDeep },
                { i: 'RL', c: '#4D7EEE' },
                { i: 'YP', c: '#B14DEE' },
              ].map((a, i) => (
                <View key={i} style={{
                  width: 28, height: 28, borderRadius: 99,
                  backgroundColor: a.c, borderWidth: 2, borderColor: HA.bg,
                  alignItems: 'center', justifyContent: 'center', marginLeft: i === 0 ? 0 : -10,
                }}>
                  <Text style={{ color: a.fg || '#fff', fontFamily: FONT.displayHeavy, fontSize: 10 }}>{a.i}</Text>
                </View>
              ))}
            </Row>
            <View style={{ flex: 1 }}>
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13 }}>
                <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold }}>147,832</Text> hustles matched
              </Text>
              <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 11, marginTop: 1 }}>
                this month alone
              </Text>
            </View>
          </Row>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(1100).duration(440)}>
        <CTADock padH={0}>
          <CTA onPress={start} hapticKind="tapMed">
            <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 17 }}>
              Start the 60-second quiz
            </Text>
            {Icon.arrow(HA.bgDeep)}
          </CTA>
          <Row justify="center" gap={6} style={{ marginTop: 12 }}>
            {Icon.lock(HA.inkSoft)}
            <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 12 }}>
              No signup. No email. No bullshit.
            </Text>
          </Row>
        </CTADock>
      </Animated.View>
    </Screen>
  );
}

function LivePulse() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
      <Animated.View style={animStyle}>
        <Dot size={6} color={HA.lime} />
      </Animated.View>
      <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, marginLeft: 6 }}>LIVE</Text>
    </Tag>
  );
}
