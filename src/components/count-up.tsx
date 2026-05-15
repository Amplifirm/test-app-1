import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// Lightweight JS-thread count-up — animates a number from 0 → target over `duration` ms.
// Prefix + suffix fade in alongside the digits so the whole value reveals as one piece
// (previously the "$" was static while the number animated, which felt mechanical).
export function CountUp({
  to, duration = 700, delay = 0, suffix = '', prefix = '', style,
}: { to: number; duration?: number; delay?: number; suffix?: string; prefix?: string; style?: StyleProp<TextStyle> }) {
  const [v, setV] = useState(0);
  const affixOpacity = useSharedValue(0);

  useEffect(() => {
    let raf: any;
    let cancel = false;
    const start = performance.now() + delay;
    affixOpacity.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) });
    const tick = (t: number) => {
      if (cancel) return;
      const elapsed = Math.max(0, t - start);
      const pct = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setV(Math.round(to * eased));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancel = true; if (raf) cancelAnimationFrame(raf); };
  }, [to, duration, delay]);

  const affixStyle = useAnimatedStyle(() => ({ opacity: affixOpacity.value }));

  if (!prefix && !suffix) {
    return <Text style={style}>{v}</Text>;
  }

  return (
    <Text style={style}>
      {prefix ? <Animated.Text style={affixStyle}>{prefix}</Animated.Text> : null}
      {v}
      {suffix ? <Animated.Text style={affixStyle}>{suffix}</Animated.Text> : null}
    </Text>
  );
}
