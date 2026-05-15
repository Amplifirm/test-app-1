import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { HA, FONT } from '~/design/tokens';

// Animated flame + day count. Flickers continuously when streak > 0.
// Dimmer + grey when streak === 0 (loss-aversion: visually invites action).
export function StreakFlame({ days, compact = false }: { days: number; compact?: boolean }) {
  const flicker = useSharedValue(1);
  const live = days > 0;

  useEffect(() => {
    if (!live) {
      flicker.value = 0.6;
      return;
    }
    flicker.value = withRepeat(
      withSequence(
        withTiming(0.92, { duration: 380, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.95, { duration: 300 }),
      ),
      -1,
      true,
    );
  }, [live]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flicker.value }],
    opacity: live ? flicker.value : 0.5,
  }));

  const color = live ? HA.lime : HA.inkSoft;
  const size = compact ? 18 : 28;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Animated.View style={flameStyle}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2c1 3 4 5 4 9a4 4 0 11-8 0c0-2 1.5-3 2-5C8 8 7 5.5 8 3c1 1 2 2 4 -1z"
            fill={color}
          />
        </Svg>
      </Animated.View>
      <Text
        style={{
          fontFamily: FONT.displayHeavy,
          fontSize: compact ? 13 : 16,
          color,
          letterSpacing: -0.4,
        }}
      >
        {days}
      </Text>
      {!compact ? (
        <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: HA.inkMuted, letterSpacing: 1 }}>
          {days === 1 ? 'DAY' : 'DAYS'}
        </Text>
      ) : null}
    </View>
  );
}
