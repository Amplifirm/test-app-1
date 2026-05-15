import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { haptic } from '~/hooks/useHaptic';

export type TabKey = 'today' | 'plan' | 'coach' | 'more';

export function PlaybookTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'plan', label: 'Plan' },
    { key: 'coach', label: 'Coach' },
    { key: 'more', label: 'More' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: HA.surface,
        borderRadius: RADIUS.card,
        borderWidth: 1,
        borderColor: HA.stroke,
        padding: 4,
        gap: 4,
      }}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => { if (!on) { haptic.tapLight(); onChange(t.key); } }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: on ? HA.bgDeep : 'transparent',
              borderWidth: on ? 1 : 0,
              borderColor: HA.strokeLime,
              alignItems: 'center',
              opacity: pressed && !on ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: on ? HA.lime : HA.inkMuted,
                fontFamily: on ? FONT.bodyBold : FONT.bodyMed,
                fontSize: 13,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
