import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { HA } from '~/design/tokens';

// One-shot confetti for celebratory moments (results reveal, paywall purchase).
// Pure JS, Expo Go compatible. Auto-fires on mount; non-blocking.
export function ConfettiBurst({ count = 110, fadeOut = true }: { count?: number; fadeOut?: boolean }) {
  const ref = useRef<ConfettiCannon | null>(null);
  const w = Dimensions.get('window').width;

  useEffect(() => {
    const t = setTimeout(() => ref.current?.start(), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <ConfettiCannon
        ref={ref}
        count={count}
        origin={{ x: w / 2, y: -10 }}
        autoStart={false}
        fadeOut={fadeOut}
        fallSpeed={2800}
        explosionSpeed={420}
        colors={[HA.lime, HA.limeDeep, '#FAFAFA', HA.coral, '#FFD66B']}
      />
    </View>
  );
}
