import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, runOnJS,
  FadeInDown,
} from 'react-native-reanimated';
import { HA, FONT } from '~/design/tokens';
import { haptic } from '~/hooks/useHaptic';

type OptionShape = { id: string; label: string; sub?: string; emoji?: string };

// ── Animated tappable that scales on press AND springs on selection change ──
function AnimatedTappable({
  children, onPress, selected, style, disabled,
}: { children: React.ReactNode; onPress: () => void; selected?: boolean; style: any; disabled?: boolean }) {
  const scale = useSharedValue(1);
  const lastSelected = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    const isNowSelected = selected ? 1 : 0;
    if (isNowSelected !== lastSelected.value) {
      lastSelected.value = isNowSelected;
      if (isNowSelected) {
        scale.value = withSequence(
          withSpring(1.05, { damping: 14, stiffness: 220 }),
          withSpring(1, { damping: 18, stiffness: 240 }),
        );
      }
    }
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={() => { if (disabled) return; onPress(); }}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 16, stiffness: 320 }); }}
        onPressOut={() => { scale.value = withSpring(selected ? 1 : 1, { damping: 18, stiffness: 240 }); }}
        style={{ flex: 1 }}
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ── ChipMultiSelect ──────────────────────────────────────────────────
export function ChipMultiSelect({
  options, value, onChange, min = 0, max,
}: { options: OptionShape[]; value: string[]; onChange: (v: string[]) => void; min?: number; max?: number }) {
  const toggle = (id: string) => {
    haptic.select();
    const has = value.includes(id);
    if (has) onChange(value.filter((x) => x !== id));
    else {
      if (max && value.length >= max) return;
      onChange([...value, id]);
    }
  };
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o, i) => {
        const on = value.includes(o.id);
        return (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 35).duration(280).springify()}>
            <ChipBtn on={on} onPress={() => toggle(o.id)} emoji={o.emoji} label={o.label} />
          </Animated.View>
        );
      })}
    </View>
  );
}

function ChipBtn({ on, onPress, emoji, label }: { on: boolean; onPress: () => void; emoji?: string; label: string }) {
  const scale = useSharedValue(1);
  const onChange = useSharedValue(on ? 1 : 0);

  useEffect(() => {
    if (on && !onChange.value) {
      scale.value = withSequence(
        withSpring(1.06, { damping: 12, stiffness: 280 }),
        withSpring(1, { damping: 18 }),
      );
    }
    onChange.value = on ? 1 : 0;
  }, [on]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 16, stiffness: 360 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 16, stiffness: 240 }); }}
        style={[
          styles.chip,
          {
            borderColor: on ? HA.lime : HA.stroke,
            backgroundColor: on ? HA.lime : HA.surface,
            shadowColor: on ? HA.lime : 'transparent',
            shadowOpacity: on ? 0.35 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {emoji ? <Text style={{ fontSize: 14, marginRight: 2 }}>{emoji}</Text> : null}
        {on ? <View style={{ marginRight: 2 }}><CheckIcon /></View> : null}
        <Text style={{
          color: on ? HA.bgDeep : HA.ink,
          fontFamily: on ? FONT.bodyBold : FONT.bodyMed, fontSize: 14,
        }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function CheckIcon() {
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 12 }}>✓</Text>
    </View>
  );
}

// ── SingleCardList ───────────────────────────────────────────────────
export function SingleCardList({
  options, value, onChange,
}: { options: (OptionShape & { sub?: string })[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 60).duration(320).springify()}>
            <AnimatedCard
              on={on}
              onPress={() => { haptic.select(); onChange(o.id); }}
              style={styles.cardBase}
            >
              <Text style={{ color: on ? HA.lime : HA.ink, fontFamily: FONT.bodyBold, fontSize: 16 }}>{o.label}</Text>
              {o.sub ? <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13, marginTop: 4 }}>{o.sub}</Text> : null}
            </AnimatedCard>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ── FourCardGrid (2x2) ──────────────────────────────────────────────
export function FourCardGrid({
  options, value, onChange,
}: { options: (OptionShape & { sub?: string })[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 90).duration(360).springify()} style={{ width: '47.5%' }}>
            <AnimatedCard
              on={on}
              onPress={() => { haptic.select(); onChange(o.id); }}
              style={styles.gridCard}
            >
              <Text style={{ color: on ? HA.lime : HA.ink, fontFamily: FONT.bodyBold, fontSize: 15, lineHeight: 19 }}>{o.label}</Text>
              {o.sub ? <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, marginTop: 6, lineHeight: 16 }}>{o.sub}</Text> : null}
            </AnimatedCard>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ── PairedCard ───────────────────────────────────────────────────────
export function PairedCard({
  options, value, onChange,
}: { options: OptionShape[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <View style={{ gap: 12 }}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 90).duration(360).springify()}>
            <AnimatedCard
              on={on}
              onPress={() => { haptic.select(); onChange(o.id); }}
              style={{ paddingVertical: 22, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1.5 }}
            >
              <Text style={{ color: on ? HA.lime : HA.ink, fontFamily: FONT.displayHeavy, fontSize: 22, lineHeight: 26, letterSpacing: -0.5 }}>{o.label}</Text>
              {(o as any).sub ? <Text style={{ color: HA.inkMuted, marginTop: 8, fontFamily: FONT.body, fontSize: 13 }}>{(o as any).sub}</Text> : null}
            </AnimatedCard>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ── AnimatedCard (used by SingleCardList, FourCardGrid, PairedCard) ──
function AnimatedCard({
  on, onPress, style, children,
}: { on: boolean; onPress: () => void; style: any; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const onChange = useSharedValue(on ? 1 : 0);

  useEffect(() => {
    if (on && !onChange.value) {
      scale.value = withSequence(
        withSpring(1.03, { damping: 12, stiffness: 240 }),
        withSpring(1, { damping: 18 }),
      );
    }
    onChange.value = on ? 1 : 0;
  }, [on]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 16, stiffness: 360 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 16, stiffness: 240 }); }}
        style={[
          style,
          {
            borderColor: on ? HA.lime : HA.stroke,
            backgroundColor: on ? HA.limeSoft : HA.surface,
            shadowColor: on ? HA.lime : 'transparent',
            shadowOpacity: on ? 0.25 : 0,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ── RankList — tap to bump up the order ──────────────────────────────
export function RankList({
  options, value, onChange,
}: { options: OptionShape[]; value: string[]; onChange: (order: string[]) => void }) {
  const fullOrder = value.length === options.length
    ? value
    : [...value, ...options.map((o) => o.id).filter((id) => !value.includes(id))];

  const promote = (id: string) => {
    haptic.select();
    const idx = fullOrder.indexOf(id);
    if (idx <= 0) return;
    const next = [...fullOrder];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const demote = (id: string) => {
    haptic.select();
    const idx = fullOrder.indexOf(id);
    if (idx === -1 || idx >= fullOrder.length - 1) return;
    const next = [...fullOrder];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    onChange(next);
  };

  return (
    <View style={{ gap: 10 }}>
      {fullOrder.map((id, i) => {
        const o = options.find((x) => x.id === id);
        if (!o) return null;
        const isTop = i === 0;
        return (
          <Animated.View key={id} entering={FadeInDown.delay(i * 50).duration(280).springify()}>
            <View style={[styles.rankRow, {
              borderColor: isTop ? HA.lime : HA.stroke,
              backgroundColor: isTop ? HA.limeSoft : HA.surface,
              shadowColor: isTop ? HA.lime : 'transparent',
              shadowOpacity: isTop ? 0.25 : 0,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
            }]}>
              <View style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: isTop ? HA.lime : HA.surfaceHi,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontFamily: FONT.monoBold, fontSize: 14, color: isTop ? HA.bgDeep : HA.ink }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, marginLeft: 12, color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 16 }}>{o.label}</Text>
              <Pressable onPress={() => promote(id)} hitSlop={8} style={styles.rankIconBtn}>
                <Text style={{ color: HA.ink, fontFamily: FONT.monoBold, fontSize: 18 }}>↑</Text>
              </Pressable>
              <Pressable onPress={() => demote(id)} hitSlop={8} style={styles.rankIconBtn}>
                <Text style={{ color: HA.ink, fontFamily: FONT.monoBold, fontSize: 18 }}>↓</Text>
              </Pressable>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ── ThrillDrain ──────────────────────────────────────────────────────
export function ThrillDrain({
  items, value, onChange,
}: {
  items: { id: string; label: string; sub: string }[];
  value: Record<string, 'thrill' | 'drain'>;
  onChange: (v: Record<string, 'thrill' | 'drain'>) => void;
}) {
  const set = (id: string, kind: 'thrill' | 'drain') => {
    haptic.select();
    onChange({ ...value, [id]: kind });
  };
  return (
    <View style={{ gap: 12 }}>
      {items.map((it, i) => (
        <Animated.View key={it.id} entering={FadeInDown.delay(i * 70).duration(300).springify()} style={styles.tdCard}>
          <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15, lineHeight: 20 }}>{it.label}</Text>
          <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, marginTop: 4 }}>{it.sub}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <SegBtn label="✨ Thrill" active={value[it.id] === 'thrill'}
              activeBg={HA.lime} activeFg={HA.bgDeep}
              onPress={() => set(it.id, 'thrill')} />
            <SegBtn label="💀 Drain" active={value[it.id] === 'drain'}
              activeBg={HA.coral} activeFg="#fff"
              onPress={() => set(it.id, 'drain')} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
function SegBtn({ label, active, activeBg, activeFg, onPress }: { label: string; active: boolean; activeBg: string; activeFg: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 16, stiffness: 320 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 240 }); }}
        style={{
          paddingVertical: 10, borderRadius: 10, alignItems: 'center',
          backgroundColor: active ? activeBg : 'transparent',
          borderWidth: 1, borderColor: active ? activeBg : HA.stroke,
        }}
      >
        <Text style={{ color: active ? activeFg : HA.ink, fontFamily: FONT.bodyBold, fontSize: 13 }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── ChartPicker (effort curve) ───────────────────────────────────────
export function ChartPicker({
  options, value, onChange,
}: { options: (OptionShape & { sub?: string })[]; value: string | null; onChange: (v: string) => void }) {
  const glyphs: Record<string, string> = { sprint: '╱──', climb: '╱╱╱', burn: '──╱' };
  return (
    <View style={{ gap: 10 }}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 70).duration(320).springify()}>
            <AnimatedCard
              on={on}
              onPress={() => { haptic.select(); onChange(o.id); }}
              style={[styles.cardBase, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}
            >
              <Text style={{ fontFamily: FONT.mono, fontSize: 32, color: on ? HA.lime : HA.ink, letterSpacing: 1 }}>{glyphs[o.id] || ''}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 16 }}>{o.label}</Text>
                {o.sub ? <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, marginTop: 3 }}>{o.sub}</Text> : null}
              </View>
            </AnimatedCard>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ── Sliders (gesture-handler + reanimated) ───────────────────────────
export function RangeSlider({
  min, max, value, onChange, step = 1,
}: { min: number; max: number; value: number; onChange: (n: number) => void; step?: number }) {
  const [width, setWidth] = useState(0);
  const cur = useSharedValue(value);

  useEffect(() => { cur.value = value; }, [value]);

  const setFromX = (x: number) => {
    if (width <= 0) return;
    const pct = Math.max(0, Math.min(1, x / width));
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    if (stepped !== cur.value) {
      cur.value = stepped;
      haptic.select();
      onChange(stepped);
    }
  };

  const pan = Gesture.Pan()
    .onBegin((e) => runOnJS(setFromX)(e.x))
    .onUpdate((e) => runOnJS(setFromX)(e.x));
  const tap = Gesture.Tap().onStart((e) => runOnJS(setFromX)(e.x));
  const combined = Gesture.Race(pan, tap);

  const fillStyle = useAnimatedStyle(() => {
    const pct = (cur.value - min) / (max - min);
    return { width: `${Math.max(0, Math.min(1, pct)) * 100}%` };
  });
  const thumbStyle = useAnimatedStyle(() => {
    const pct = (cur.value - min) / (max - min);
    return { left: `${Math.max(0, Math.min(1, pct)) * 100}%` };
  });

  return (
    <GestureDetector gesture={combined}>
      <View style={styles.sliderTrackWrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.sliderTrack} />
        <Animated.View style={[styles.sliderFill, fillStyle]} />
        <Animated.View style={[styles.sliderThumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  cardBase: {
    paddingVertical: 16, paddingHorizontal: 16, borderRadius: 14,
    borderWidth: 1.5,
  },
  gridCard: {
    minHeight: 96, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5,
  },
  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5,
  },
  rankIconBtn: {
    width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    backgroundColor: HA.surfaceHi, borderWidth: 1, borderColor: HA.stroke, marginLeft: 6,
  },
  tdCard: {
    paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke,
  },
  sliderTrackWrap: {
    height: 40, justifyContent: 'center',
  },
  sliderTrack: {
    height: 6, borderRadius: 99, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: HA.stroke,
  },
  sliderFill: {
    position: 'absolute', left: 0, height: 6, borderRadius: 99, backgroundColor: HA.lime,
    shadowColor: HA.lime, shadowOpacity: 0.4, shadowRadius: 8,
  },
  sliderThumb: {
    position: 'absolute', width: 28, height: 28, borderRadius: 99,
    backgroundColor: HA.ink, marginLeft: -14, top: 6,
    borderWidth: 1.5, borderColor: HA.lime,
    shadowColor: HA.lime, shadowOpacity: 0.5, shadowRadius: 10,
  },
});
