import React, { ReactNode, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withSpring, FadeIn, FadeOut,
} from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { Row, Icon, MonoLabel, Tag, Dot } from './atoms';

// ── Screen wrapper ───────────────────────────────────────────────────
export function Screen({
  children, bg = HA.bg, padH = 20, style,
}: { children: ReactNode; bg?: string; padH?: number; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
      { flex: 1, backgroundColor: bg, paddingTop: insets.top + 8, paddingHorizontal: padH },
      style,
    ]}>
      {children}
    </View>
  );
}

// ── Bottom CTA dock (safe-area-aware) ─────────────────────────────────
export function CTADock({ children, padH = 20 }: { children: ReactNode; padH?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: insets.bottom + 16, paddingTop: 12, paddingHorizontal: padH }}>
      {children}
    </View>
  );
}

// ── Animated progress dot (springs to new width) ─────────────────────
function ProgressDot({ active }: { active: boolean }) {
  const w = useSharedValue(active ? 20 : 8);
  useEffect(() => {
    w.value = withSpring(active ? 20 : 8, { damping: 18, stiffness: 220 });
  }, [active]);
  const style = useAnimatedStyle(() => ({ width: w.value }));
  return (
    <Animated.View style={[
      { height: 4, borderRadius: 99, backgroundColor: active ? HA.lime : 'rgba(255,255,255,0.15)' },
      style,
    ]} />
  );
}

// ── TopBar ───────────────────────────────────────────────────────────
export function TopBar({
  onBack, step, total, label, right,
}: { onBack?: () => void; step?: number; total?: number; label?: ReactNode; right?: ReactNode }) {
  return (
    <Row justify="space-between" style={{ marginBottom: 16 }}>
      <Row gap={10}>
        {onBack ? (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            {Icon.back(HA.ink)}
          </Pressable>
        ) : null}
        {label
          ? (typeof label === 'string' ? <MonoLabel>{label}</MonoLabel> : label)
          : null}
      </Row>
      {step && total ? (
        <Row gap={4}>
          {Array.from({ length: total }).map((_, i) => (
            <ProgressDot key={i} active={i < step} />
          ))}
        </Row>
      ) : right}
    </Row>
  );
}

// ── Signal counter — flashes lime + bumps scale when captured increments ──
export function SignalCounter({ captured, total }: { captured: number; total: number }) {
  const prev = useRef(captured);
  const scale = useSharedValue(1);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (captured > prev.current) {
      scale.value = withSequence(
        withSpring(1.12, { damping: 12, stiffness: 220 }),
        withSpring(1, { damping: 16 }),
      );
      flash.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 280 }));
    }
    prev.current = captured;
  }, [captured]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const textStyle = useAnimatedStyle(() => {
    // Lime when flashing, default soft otherwise
    return {
      color: flash.value > 0.05 ? HA.lime : HA.inkSoft,
    } as any;
  });

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, animStyle]}>
      <Dot size={5} color={HA.lime} />
      <Animated.Text style={[{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.4 }, textStyle]}>
        SIGNAL {String(captured).padStart(2, '0')} / {total}
      </Animated.Text>
    </Animated.View>
  );
}

// ── Observation toast ─────────────────────────────────────────────────
export function ObservationToast({ visible, message }: { visible: boolean; message: string }) {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.toast}>
      <Dot size={5} color={HA.lime} />
      <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>
        {message}
      </Text>
    </Animated.View>
  );
}

// ── Confidence band ───────────────────────────────────────────────────
export function ConfidenceBand({
  confidence, captured, total, pulse = false,
}: { confidence: 'medium' | 'high'; captured: number; total: number; pulse?: boolean }) {
  const glow = useSharedValue(pulse ? 1 : 0);

  useEffect(() => {
    if (pulse) {
      glow.value = withSequence(
        withTiming(1, { duration: 400 }),
        withRepeat(withSequence(withTiming(0.45, { duration: 800 }), withTiming(1, { duration: 800 })), 3, true),
      );
    }
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({
    shadowOpacity: confidence === 'high' ? 0.4 * glow.value : 0,
  }));

  const high = confidence === 'high';
  return (
    <Animated.View style={[
      styles.bandBase,
      {
        borderColor: high ? HA.strokeLime : HA.stroke,
        backgroundColor: high ? HA.limeSoft : HA.surface,
        shadowColor: HA.lime, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
      },
      animStyle,
    ]}>
      <Row gap={10} align="center">
        <View style={{
          width: 8, height: 8, borderRadius: 99,
          backgroundColor: high ? HA.lime : HA.inkMuted,
        }} />
        <Text style={{ fontFamily: FONT.monoBold, fontSize: 11, letterSpacing: 1.4, color: high ? HA.lime : HA.ink }}>
          {high ? 'HIGH CONFIDENCE' : 'MEDIUM CONFIDENCE'}
        </Text>
      </Row>
      <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: HA.inkMuted, letterSpacing: 0.8 }}>
        {captured} / {total} SIGNALS
      </Text>
    </Animated.View>
  );
}

// ── WHY bullet ───────────────────────────────────────────────────────
export function WhyBulletView({ text, negative }: { text: string; negative?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row', gap: 10, alignItems: 'flex-start',
      paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
      backgroundColor: negative ? HA.coralSoft : HA.surface,
      borderWidth: 1, borderColor: negative ? 'rgba(255,92,57,0.25)' : HA.stroke,
    }}>
      <View style={{
        width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center',
        backgroundColor: negative ? HA.coral : HA.lime, flexShrink: 0,
      }}>
        {negative ? Icon.warn('#fff', 12) : Icon.check(HA.bgDeep, 11)}
      </View>
      <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 13.5, lineHeight: 19 }}>
        {text}
      </Text>
    </View>
  );
}

export function Grain() {
  return null;
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, borderColor: HA.strokeBold, backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.strokeLime,
    marginVertical: 8,
  },
  bandBase: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
  },
});
