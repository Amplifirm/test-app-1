import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { MonoLabel, Row } from './atoms';
import { haptic } from '~/hooks/useHaptic';

export function PauseSheet({
  visible,
  pausesUsed,
  onPause,
  onClose,
}: {
  visible: boolean;
  pausesUsed: number;
  onPause: (hours: number) => void;
  onClose: () => void;
}) {
  const remaining = Math.max(0, 2 - pausesUsed);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: HA.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 36,
            borderTopWidth: 1,
            borderColor: HA.stroke,
          }}
        >
          <MonoLabel color={HA.inkSoft}>PAUSE STREAK</MonoLabel>
          <Text
            style={{
              marginTop: 8,
              fontFamily: FONT.displayHeavy,
              fontSize: 26,
              color: HA.ink,
              letterSpacing: -1,
              lineHeight: 30,
            }}
          >
            Life happened.
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
            Your streak stays alive. {remaining} of 2 pauses left in this 90-day playbook.
          </Text>

          <Row gap={10} style={{ marginTop: 22 }}>
            <PauseChoice
              label="24 hours"
              disabled={remaining === 0}
              onPress={() => { haptic.tapMed(); onPause(24); onClose(); }}
            />
            <PauseChoice
              label="48 hours"
              disabled={remaining === 0}
              onPress={() => { haptic.tapMed(); onPause(48); onClose(); }}
            />
            <PauseChoice
              label="72 hours"
              disabled={remaining === 0}
              onPress={() => { haptic.tapMed(); onPause(72); onClose(); }}
            />
          </Row>

          <Pressable
            onPress={() => { haptic.tapLight(); onClose(); }}
            style={({ pressed }) => ({
              marginTop: 18,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 14 }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PauseChoice({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 14,
        borderRadius: RADIUS.card,
        backgroundColor: disabled ? HA.surfaceHi : HA.surface,
        borderWidth: 1,
        borderColor: HA.stroke,
        alignItems: 'center',
        opacity: disabled ? 0.4 : (pressed ? 0.85 : 1),
      })}
    >
      <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
