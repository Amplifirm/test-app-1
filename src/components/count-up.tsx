import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

// Lightweight JS-thread count-up — animates a number from 0 → target over `duration` ms.
// Good enough for short, occasional animations (results page). UI thread reserved for
// per-frame interactions (sliders, presses).
export function CountUp({
  to, duration = 700, delay = 0, suffix = '', prefix = '', style,
}: { to: number; duration?: number; delay?: number; suffix?: string; prefix?: string; style?: StyleProp<TextStyle> }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf: any;
    let cancel = false;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      if (cancel) return;
      const elapsed = Math.max(0, t - start);
      const pct = Math.min(1, elapsed / duration);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setV(Math.round(to * eased));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancel = true; if (raf) cancelAnimationFrame(raf); };
  }, [to, duration, delay]);

  return <Text style={style}>{`${prefix}${v}${suffix}`}</Text>;
}
