import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, useDerivedValue,
  withTiming, Easing, FadeIn,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Polygon, Circle, G } from 'react-native-svg';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Tag, Dot, MonoLabel } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { buildUserVector } from '~/lib/score';
import { RIASEC_DIMS, DIM_NAMES } from '~/lib/dimensions';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// 5 stages × 700ms = 3.5s total (research said 2-4s sweet spot)
const STAGES = [
  { label: 'Scanning your 17 signals…',     duration: 700 },
  { label: 'Building your axis vector…',     duration: 700 },
  { label: 'Filtering by hours + budget…',   duration: 700 },
  { label: 'Scoring 30 hustles…',            duration: 700 },
  { label: 'Personalizing your why…',        duration: 700 },
];

const FILTER_TICKS = [30, 24, 17, 11, 6, 3];

// 17-pointed polygon constants
const POLY_POINTS = 17;
const POLY_RADIUS = 78;
const POLY_CENTER = 90; // SVG viewBox center (180×180)

// Pre-compute chaotic vs balanced point sets
const CHAOTIC_RADII = Array.from({ length: POLY_POINTS }, (_, i) => {
  // Pseudo-random but deterministic — varies 0.45×R to 1.0×R
  const seed = Math.sin(i * 1.7 + 3.14) * 10000;
  const r = 0.45 + Math.abs(seed - Math.floor(seed)) * 0.55;
  return POLY_RADIUS * r;
});

function pointsString(radii: number[]): string {
  return radii
    .map((r, i) => {
      const angle = (i / POLY_POINTS) * Math.PI * 2 - Math.PI / 2;
      const x = POLY_CENTER + Math.cos(angle) * r;
      const y = POLY_CENTER + Math.sin(angle) * r;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

const CHAOTIC_POINTS = pointsString(CHAOTIC_RADII);
const BALANCED_POINTS = pointsString(new Array(POLY_POINTS).fill(POLY_RADIUS));

export default function ThinkingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [filterIdx, setFilterIdx] = useState(0);
  const answers = useApp((s) => s.answers);
  const morphProgress = useSharedValue(0);    // 0 = chaotic, 1 = balanced
  const polyRotation = useSharedValue(0);     // continuous gentle rotation
  const polyGlow = useSharedValue(0.55);      // pulses subtly

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

  const totalDuration = STAGES.reduce((a, s) => a + s.duration, 0);

  // Start morph + rotation animations
  useEffect(() => {
    morphProgress.value = withTiming(1, {
      duration: totalDuration - 200,
      easing: Easing.inOut(Easing.cubic),
    });
    polyRotation.value = withTiming(360, {
      duration: totalDuration + 400,
      easing: Easing.linear,
    });
  }, []);

  // Step progression
  useEffect(() => {
    if (step >= STAGES.length) {
      const t = setTimeout(() => router.replace('/results'), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STAGES[step]?.duration ?? 500);
    return () => clearTimeout(t);
  }, [step, router]);

  // Filter ticker
  useEffect(() => {
    if (filterIdx >= FILTER_TICKS.length - 1) return;
    const each = totalDuration / (FILTER_TICKS.length - 1);
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
        <Polygon17 morphProgress={morphProgress} rotation={polyRotation} />

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

        <View style={{ width: '100%', padding: 16, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          {STAGES.map((line, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6, alignItems: 'center', opacity: done || active ? 1 : 0.3 }}>
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
          <Text style={{ marginTop: 10, color: HA.inkSoft, fontFamily: FONT.body, fontSize: 11, fontStyle: 'italic' }}>
            Same answers = same matches. Always.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

// 17-pointed polygon that morphs from chaotic radii → balanced regular shape.
// Mirrors the matching algorithm: "your scattered answers becoming an ordered profile."
function Polygon17({
  morphProgress,
  rotation,
}: {
  morphProgress: SharedValue<number>;
  rotation: SharedValue<number>;
}) {
  // Compute interpolated points (CHAOTIC → BALANCED) on the UI thread.
  const animatedPolyProps = useAnimatedProps(() => {
    const t = morphProgress.value;
    const radii = CHAOTIC_RADII.map((r) => r + (POLY_RADIUS - r) * t);
    const pts = radii
      .map((r, i) => {
        const angle = (i / POLY_POINTS) * Math.PI * 2 - Math.PI / 2;
        const x = POLY_CENTER + Math.cos(angle) * r;
        const y = POLY_CENTER + Math.sin(angle) * r;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
    return { points: pts };
  });

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Pulse intensity for the inner glow circle
  const glowOpacity = useDerivedValue(() =>
    0.35 + Math.sin(rotation.value * 0.05) * 0.15
  );
  const glowProps = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[{ width: 180, height: 180 }, wrapStyle]}>
      <Svg width={180} height={180} viewBox="0 0 180 180">
        <G>
          {/* Inner glow */}
          <AnimatedCircle cx={90} cy={90} r={48} fill={HA.lime} animatedProps={glowProps} />
          {/* Outer balanced ring (subtle) */}
          <Polygon
            points={BALANCED_POINTS}
            fill="none"
            stroke={HA.strokeLime}
            strokeWidth={1}
          />
          {/* The morphing polygon — the hero */}
          <AnimatedPolygon
            animatedProps={animatedPolyProps}
            fill={HA.lime}
            fillOpacity={0.18}
            stroke={HA.lime}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* 17 vertex dots */}
          {Array.from({ length: POLY_POINTS }).map((_, i) => (
            <PolyVertex key={i} index={i} morphProgress={morphProgress} />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
}

function PolyVertex({ index, morphProgress }: { index: number; morphProgress: SharedValue<number> }) {
  const angle = (index / POLY_POINTS) * Math.PI * 2 - Math.PI / 2;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const props = useAnimatedProps(() => {
    const t = morphProgress.value;
    const r = CHAOTIC_RADII[index] + (POLY_RADIUS - CHAOTIC_RADII[index]) * t;
    return {
      cx: POLY_CENTER + cosA * r,
      cy: POLY_CENTER + sinA * r,
    };
  });
  return <AnimatedCircle r={2.5} fill={HA.lime} animatedProps={props} />;
}
