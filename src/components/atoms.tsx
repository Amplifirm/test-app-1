import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { HA, FONT } from '~/design/tokens';
import { haptic } from '~/hooks/useHaptic';

// ── Stack / Row ──────────────────────────────────────────────────────
export function Stack({ children, gap = 12, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'column', gap }, style]}>{children}</View>;
}
export function Row({
  children, gap = 8, style, align = 'center', justify = 'flex-start', wrap = false,
}: {
  children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>;
  align?: ViewStyle['alignItems']; justify?: ViewStyle['justifyContent']; wrap?: boolean;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: align, justifyContent: justify, gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>
      {children}
    </View>
  );
}

// ── Tag / Pill / Dot ─────────────────────────────────────────────────
export function Tag({
  children, color = HA.inkMuted, bg = 'transparent', border = HA.strokeBold, style,
}: { children: ReactNode; color?: string; bg?: string; border?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg, borderColor: border }, style]}>
      {typeof children === 'string'
        ? <Text style={{ color, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>{children}</Text>
        : children}
    </View>
  );
}
export function Pill({
  children, color = HA.ink, bg = 'transparent', border = HA.strokeBold, style,
}: { children: ReactNode; color?: string; bg?: string; border?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: border }, style]}>
      {typeof children === 'string'
        ? <Text style={{ color, fontFamily: FONT.bodyMed, fontSize: 12 }}>{children}</Text>
        : children}
    </View>
  );
}
export function Dot({ size = 6, color = HA.lime, style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width: size, height: size, borderRadius: 99, backgroundColor: color }, style]} />;
}

// ── Sticker (rotated badge) ──────────────────────────────────────────
export function Sticker({
  children, rotate = -6, color = HA.lime, fg = HA.bgDeep, style,
}: { children: ReactNode; rotate?: number; color?: string; fg?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[
      {
        position: 'absolute', transform: [{ rotate: `${rotate}deg` }],
        paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: color,
        shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      },
      style,
    ]}>
      <Text style={{ color: fg, fontFamily: FONT.monoBold, fontSize: 11, letterSpacing: 1.2 }}>
        {String(children).toUpperCase()}
      </Text>
    </View>
  );
}

// ── Icons (SVG) ──────────────────────────────────────────────────────
export const Icon = {
  arrow: (c: string = HA.bgDeep, size = 18) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  back: (c: string = HA.ink, size = 18) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  check: (c: string = HA.bgDeep, size = 14) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12l5 5L20 7" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  spark: (c: string = HA.bgDeep, size = 14) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill={c} />
    </Svg>
  ),
  lock: (c: string = HA.inkMuted, size = 12) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={11} width={16} height={10} rx={2} stroke={c} strokeWidth={2} />
      <Path d="M8 11V8a4 4 0 018 0v3" stroke={c} strokeWidth={2} />
    </Svg>
  ),
  copy: (c: string = HA.ink, size = 14) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={8} y={8} width={12} height={12} rx={2} stroke={c} strokeWidth={2} />
      <Path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke={c} strokeWidth={2} />
    </Svg>
  ),
  warn: (c: string = HA.coral, size = 14) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l11 18H1L12 3z" stroke={c} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M12 10v5" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={18} r={1} fill={c} />
    </Svg>
  ),
};

// ── CTA / CTAOutline ─────────────────────────────────────────────────
export function CTA({
  children, onPress, disabled = false, hapticKind = 'tapMed' as 'tapLight' | 'tapMed' | 'success',
  bg = HA.lime, fg = HA.bgDeep, style,
}: {
  children: ReactNode; onPress?: () => void; disabled?: boolean; hapticKind?: 'tapLight' | 'tapMed' | 'success';
  bg?: string; fg?: string; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={() => { if (disabled) return; haptic[hapticKind](); onPress?.(); }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.ctaBase,
        {
          backgroundColor: disabled ? HA.surfaceHi : bg,
          opacity: disabled ? 0.5 : (pressed ? 0.92 : 1),
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {typeof children === 'string'
        ? <Text style={{ color: disabled ? HA.inkSoft : fg, fontFamily: FONT.bodyBold, fontSize: 17 }}>{children}</Text>
        : children}
    </Pressable>
  );
}
export function CTAOutline({
  children, onPress, style,
}: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={() => { haptic.tapLight(); onPress?.(); }}
      style={({ pressed }) => [
        styles.ctaOutline,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {typeof children === 'string'
        ? <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 16 }}>{children}</Text>
        : children}
    </Pressable>
  );
}

// ── Big text helper ──────────────────────────────────────────────────
export function Headline({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: FONT.displayHeavy, fontSize: 36, color: HA.ink, letterSpacing: -1.4, lineHeight: 38 }, style]}>{children}</Text>;
}
export function Sub({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: FONT.body, fontSize: 14, color: HA.inkMuted, lineHeight: 20 }, style]}>{children}</Text>;
}
export function MonoLabel({ children, color = HA.inkSoft, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: FONT.mono, fontSize: 11, color, letterSpacing: 1.2 }, style]}>{String(children).toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  pill: {
    paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  ctaBase: {
    width: '100%', height: 60, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaOutline: {
    width: '100%', height: 56, borderRadius: 16, backgroundColor: 'transparent',
    borderWidth: 1.5, borderColor: HA.strokeBold,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
});
