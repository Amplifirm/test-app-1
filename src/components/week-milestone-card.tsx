import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { Icon, MonoLabel, Row } from './atoms';
import { ConfettiBurst } from './confetti-burst';

export function WeekMilestoneCard({
  visible,
  week,
  hustleTitle,
  rewardLabel,
  onClose,
}: {
  visible: boolean;
  week: number;
  hustleTitle: string;
  rewardLabel?: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <ConfettiBurst count={140} />

        <Animated.View
          entering={FadeInUp.duration(420).springify()}
          style={{
            backgroundColor: HA.surface,
            borderRadius: RADIUS.bigCard,
            borderWidth: 1.5,
            borderColor: HA.strokeLime,
            padding: 24,
            shadowColor: HA.lime,
            shadowOpacity: 0.35,
            shadowRadius: 32,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Row gap={8}>
            {Icon.spark(HA.lime, 16)}
            <MonoLabel color={HA.lime}>WEEK {week.toString().padStart(2, '0')} COMPLETE</MonoLabel>
          </Row>

          <Text
            style={{
              marginTop: 12,
              fontFamily: FONT.displayHeavy,
              fontSize: 32,
              color: HA.ink,
              letterSpacing: -1.4,
              lineHeight: 36,
            }}
          >
            Streak earned.
          </Text>

          <Text
            style={{
              marginTop: 8,
              color: HA.inkMuted,
              fontFamily: FONT.body,
              fontSize: 14,
              lineHeight: 21,
            }}
          >
            You finished week {week} of {hustleTitle}. Top 14% of users get this far on this hustle.
          </Text>

          {rewardLabel ? (
            <Animated.View
              entering={FadeIn.delay(220).duration(380)}
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: RADIUS.card,
                backgroundColor: HA.limeSoft,
                borderWidth: 1,
                borderColor: HA.strokeLime,
              }}
            >
              <MonoLabel color={HA.lime}>UNLOCKED</MonoLabel>
              <Text style={{ marginTop: 6, color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15 }}>
                {rewardLabel}
              </Text>
            </Animated.View>
          ) : null}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              marginTop: 24,
              paddingVertical: 14,
              borderRadius: RADIUS.card,
              backgroundColor: HA.lime,
              alignItems: 'center',
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 15 }}>
              Continue to week {week + 1}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
