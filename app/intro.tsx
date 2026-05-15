import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withTiming, withSpring, withSequence, withDelay, withRepeat,
  Easing, runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { HA, FONT } from '~/design/tokens';
import { haptic } from '~/hooks/useHaptic';
import { markIntroShown } from '~/lib/intro-state';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TYPE_TEXT = 'We measure.';
const TYPE_PER_CHAR_MS = 32;
const DOTS = 17;

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;
const RADIUS = Math.min(width, height) * 0.32;

export default function IntroScreen() {
  const router = useRouter();

  const typedChars = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const dotsProgress = useSharedValue(0);       // 0=center, 1=at radius
  const dotsContracted = useSharedValue(0);     // 0=at radius, 1=back to center
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Stage 1: type "We measure." letter by letter (with haptic per char)
    textOpacity.value = withTiming(1, { duration: 180 });

    for (let i = 1; i <= TYPE_TEXT.length; i++) {
      typedChars.value = withDelay(
        180 + i * TYPE_PER_CHAR_MS,
        withTiming(i, { duration: 1 }, (finished) => {
          if (finished && TYPE_TEXT[i - 1] !== ' ') {
            runOnJS(haptic.tapLight)();
          }
        }),
      );
    }

    const typingDoneAt = 180 + TYPE_TEXT.length * TYPE_PER_CHAR_MS;

    // Stage 2: 17 dots radiate out from center
    dotsProgress.value = withDelay(
      typingDoneAt + 120,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );

    // Stage 3: dots converge back to center
    dotsContracted.value = withDelay(
      typingDoneAt + 620,
      withTiming(1, { duration: 320, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(haptic.tapMed)();
        }
      }),
    );

    // Stage 4: logo bloom
    logoOpacity.value = withDelay(typingDoneAt + 900, withTiming(1, { duration: 260 }));
    logoScale.value = withDelay(
      typingDoneAt + 900,
      withSequence(
        withSpring(1.08, { damping: 12, stiffness: 220 }),
        withSpring(1, { damping: 18, stiffness: 220 }),
      ),
    );

    // Stage 5: crossfade out → navigate
    const fadeStart = typingDoneAt + 1260;
    screenOpacity.value = withDelay(fadeStart, withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(markIntroShown)();
        runOnJS(router.replace)('/' as any);
      }
    }));

    // Safety net — if anything fails, force-advance after 3s
    const fallback = setTimeout(() => {
      markIntroShown();
      router.replace('/' as any);
    }, 3000);
    return () => clearTimeout(fallback);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const textWrapperStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const logoWrapperStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: HA.bgDeep }, containerStyle]}>
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <G>
          {Array.from({ length: DOTS }).map((_, i) => (
            <Dot key={i} index={i} progress={dotsProgress} contracted={dotsContracted} />
          ))}
        </G>
      </Svg>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={textWrapperStyle}>
          <TypedText typedChars={typedChars} />
        </Animated.View>

        <Animated.View style={[{ marginTop: 18, alignItems: 'center' }, logoWrapperStyle]}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: HA.lime,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: HA.lime,
              shadowOpacity: 0.5,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Text style={{ color: HA.bgDeep, fontFamily: FONT.displayHeavy, fontSize: 28, letterSpacing: -1 }}>H</Text>
          </View>
          <Text style={{ marginTop: 12, color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.6 }}>
            HUSTLEAI
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function Dot({
  index, progress, contracted,
}: { index: number; progress: SharedValue<number>; contracted: SharedValue<number> }) {
  const angle = (index / DOTS) * Math.PI * 2 - Math.PI / 2;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const animatedProps = useAnimatedProps(() => {
    const outward = progress.value * (1 - contracted.value);
    const r = RADIUS * outward;
    return {
      cx: CENTER_X + cosA * r,
      cy: CENTER_Y + sinA * r,
      opacity: progress.value * (0.85 + 0.15 * (1 - contracted.value)),
    };
  });
  return <AnimatedCircle r={4.5} fill={HA.lime} animatedProps={animatedProps} />;
}

function TypedText({ typedChars }: { typedChars: SharedValue<number> }) {
  // We render the full string but mask via opacity per character.
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      {TYPE_TEXT.split('').map((ch, i) => (
        <TypedChar key={i} ch={ch} index={i} typedChars={typedChars} />
      ))}
    </View>
  );
}

function TypedChar({ ch, index, typedChars }: { ch: string; index: number; typedChars: SharedValue<number> }) {
  const charStyle = useAnimatedStyle(() => ({
    opacity: typedChars.value > index ? 1 : 0,
  }));
  return (
    <Animated.Text
      style={[
        {
          color: HA.ink,
          fontFamily: FONT.displayHeavy,
          fontSize: 44,
          letterSpacing: -2,
          lineHeight: 48,
        },
        charStyle,
      ]}
    >
      {ch}
    </Animated.Text>
  );
}
