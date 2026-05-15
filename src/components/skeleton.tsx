import React, { useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { HA } from '~/design/tokens';

// Shimmer skeleton — used to indicate loading state (preferred over spinners).
// Two-tone shimmer via opacity oscillation. Pure JS, Expo Go ✓.
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const op = useSharedValue(0.45);
  useEffect(() => {
    op.value = withRepeat(
      withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: HA.surfaceHi },
        animStyle,
        style,
      ]}
    />
  );
}

// Pre-set group for chat-style placeholders.
export function SkeletonChatBubble() {
  return (
    <View style={{ alignSelf: 'flex-start', maxWidth: '85%', marginTop: 8, padding: 10, borderRadius: 14, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke, gap: 6 }}>
      <Skeleton width={210} height={10} />
      <Skeleton width={160} height={10} />
      <Skeleton width={120} height={10} />
    </View>
  );
}
