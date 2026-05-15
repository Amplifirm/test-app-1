import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn, FadeInUp, useSharedValue, useAnimatedProps, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import Svg, { Polygon, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Tag, MonoLabel } from '~/components/atoms';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const AXES = ['R', 'I', 'A', 'S', 'E', 'C', 'Co', 'Ex', 'Op', 'IT', 'Sp', 'Re', 'Ri', 'Spr', 'Sc', 'Vi', 'Te'];

export default function OnboardingCalibrate() {
  const router = useRouter();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) });
    const t = setTimeout(() => router.replace('/(quiz)/q1-skills'), 2200);
    return () => clearTimeout(t);
  }, []);

  // Build radar polygon — start small in center, expand to baseline
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 30;
  const n = AXES.length;
  const baselineRadius = radius * 0.55;

  const points = AXES.map((_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = center + Math.cos(angle) * baselineRadius;
    const y = center + Math.sin(angle) * baselineRadius;
    return { x, y };
  });

  const animatedProps = useAnimatedProps(() => {
    const t = progress.value;
    const animPoints = AXES.map((_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = baselineRadius * t;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    }).join(' ');
    return { points: animPoints } as any;
  });

  return (
    <Screen>
      <TopBar
        label={<MonoLabel color={HA.lime}>CALIBRATING</MonoLabel>}
        right={<Tag>2 / 2</Tag>}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.Text
          entering={FadeIn.delay(80).duration(360)}
          style={{ fontFamily: FONT.displayHeavy, fontSize: 28, color: HA.ink, letterSpacing: -1.2, textAlign: 'center', marginBottom: 26 }}
        >
          We're listening for{'\n'}
          <Text style={{ color: HA.lime }}>17 different signals.</Text>
        </Animated.Text>

        {/* Radar chart */}
        <Animated.View entering={FadeIn.delay(150).duration(420)}>
          <Svg width={size} height={size}>
            {/* concentric rings */}
            {[0.33, 0.66, 1].map((r, i) => {
              const ringPoints = AXES.map((_, j) => {
                const angle = (j / n) * Math.PI * 2 - Math.PI / 2;
                const x = center + Math.cos(angle) * radius * r;
                const y = center + Math.sin(angle) * radius * r;
                return `${x},${y}`;
              }).join(' ');
              return (
                <Polygon key={i} points={ringPoints} fill="transparent" stroke={HA.stroke} strokeWidth={1} />
              );
            })}
            {/* spokes + labels */}
            {AXES.map((label, i) => {
              const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
              const x2 = center + Math.cos(angle) * radius;
              const y2 = center + Math.sin(angle) * radius;
              const lx = center + Math.cos(angle) * (radius + 16);
              const ly = center + Math.sin(angle) * (radius + 16);
              return (
                <G key={i}>
                  <Line x1={center} y1={center} x2={x2} y2={y2} stroke={HA.stroke} strokeWidth={0.5} />
                  <SvgText
                    x={lx} y={ly + 3} fontSize={8}
                    fill={HA.inkSoft}
                    fontFamily={FONT.mono}
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            })}
            {/* animated baseline polygon */}
            <AnimatedPolygon
              animatedProps={animatedProps}
              fill={HA.lime}
              fillOpacity={0.18}
              stroke={HA.lime}
              strokeWidth={1.5}
            />
            <Circle cx={center} cy={center} r={3} fill={HA.lime} />
          </Svg>
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(800).duration(380)}
          style={{ marginTop: 26, color: HA.inkMuted, fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1.4 }}
        >
          NEUTRAL PRIOR ESTABLISHED · 50/100 ON ALL AXES
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(1100).duration(380)}
          style={{ marginTop: 8, color: HA.inkSoft, fontFamily: FONT.body, fontSize: 13 }}
        >
          Every answer adjusts this fingerprint.
        </Animated.Text>
      </View>
    </Screen>
  );
}
