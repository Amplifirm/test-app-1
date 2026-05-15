import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, FadeIn,
} from 'react-native-reanimated';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { Icon, MonoLabel, Row } from './atoms';
import { haptic } from '~/hooks/useHaptic';

export function TodayTaskCard({
  dayNumber,
  title,
  minutes,
  description,
  successCriteria,
  done,
  onMarkDone,
  onSkip,
}: {
  dayNumber: number;
  title: string;
  minutes: number;
  description: string;
  successCriteria: string;
  done: boolean;
  onMarkDone: () => void;
  onSkip?: () => void;
}) {
  const scale = useSharedValue(1);
  const [animating, setAnimating] = useState(false);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleDone = () => {
    if (done || animating) return;
    setAnimating(true);
    haptic.tapMed();
    scale.value = withSequence(
      withSpring(0.97, { damping: 14, stiffness: 280 }),
      withSpring(1.02, { damping: 12, stiffness: 220 }),
      withSpring(1, { damping: 18, stiffness: 240 }),
    );
    setTimeout(() => {
      onMarkDone();
      setAnimating(false);
    }, 200);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(360)}
      style={[
        {
          padding: 18,
          borderRadius: RADIUS.bigCard,
          backgroundColor: done ? HA.limeSoft : HA.surface,
          borderWidth: 1,
          borderColor: done ? HA.strokeLime : HA.stroke,
        },
        cardStyle,
      ]}
    >
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <MonoLabel color={done ? HA.lime : HA.inkSoft}>{done ? `DAY ${dayNumber} · DONE` : `TODAY · DAY ${dayNumber}`}</MonoLabel>
        <Text style={{ color: HA.inkMuted, fontFamily: FONT.mono, fontSize: 11, letterSpacing: 0.6 }}>{minutes} min</Text>
      </Row>

      <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 24, color: HA.ink, letterSpacing: -1, lineHeight: 28 }}>
        {title}
      </Text>

      <Text style={{ marginTop: 8, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
        {description}
      </Text>

      <View
        style={{
          marginTop: 12, padding: 10, borderRadius: 10,
          backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke,
          flexDirection: 'row', gap: 8, alignItems: 'flex-start',
        }}
      >
        <View style={{ marginTop: 2 }}>{Icon.check(HA.lime, 13)}</View>
        <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 18 }}>
          {successCriteria}
        </Text>
      </View>

      {!done ? (
        <Row gap={10} style={{ marginTop: 16 }}>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 14,
              borderRadius: RADIUS.card,
              backgroundColor: HA.lime,
              alignItems: 'center',
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 15 }}>Mark done</Text>
          </Pressable>
          {onSkip ? (
            <Pressable
              onPress={() => { haptic.tapLight(); onSkip(); }}
              style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: 18,
                borderRadius: RADIUS.card,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: HA.strokeBold,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 14 }}>Skip</Text>
            </Pressable>
          ) : null}
        </Row>
      ) : (
        <Text style={{ marginTop: 16, color: HA.lime, fontFamily: FONT.bodyBold, fontSize: 14 }}>
          ✓ Done. Streak alive.
        </Text>
      )}
    </Animated.View>
  );
}
