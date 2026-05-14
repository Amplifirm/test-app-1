import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Row, Stack, Icon, MonoLabel } from '~/components/atoms';
import * as Clipboard from 'expo-clipboard';
import { haptic } from '~/hooks/useHaptic';

const CODE = 'UNFAIR-7K2X';

export default function ReferralsScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(`hustleai.com/r/${CODE}`).catch(() => {});
    haptic.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Screen>
      <TopBar onBack={() => router.back()} label="Refer & earn" />
      <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 36, color: HA.ink, letterSpacing: -1.8, lineHeight: 38 }}>
        Pass the <Text style={{ color: HA.lime }}>unfair</Text> on.
      </Text>
      <Text style={{ marginTop: 12, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
        Send a friend their first match — they get the $19 playbook free. You get <Text style={{ color: HA.lime, fontFamily: FONT.bodyBold }}>one month</Text> for every unlock.
      </Text>

      <View style={{
        marginTop: 18, padding: 14, borderRadius: 14,
        backgroundColor: HA.surface, borderWidth: 1.5, borderColor: HA.strokeLime,
      }}>
        <MonoLabel>YOUR LINK</MonoLabel>
        <View style={{
          marginTop: 8, padding: 12, borderRadius: 10, backgroundColor: HA.bgDeep,
          borderWidth: 1, borderColor: HA.stroke,
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Text numberOfLines={1} style={{ flex: 1, color: HA.ink, fontFamily: FONT.mono, fontSize: 13 }}>
            hustleai.com/r/<Text style={{ color: HA.lime, fontFamily: FONT.monoBold }}>{CODE}</Text>
          </Text>
          <Pressable onPress={copy} style={({ pressed }) => [{
            paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
            backgroundColor: HA.lime, opacity: pressed ? 0.85 : 1,
            flexDirection: 'row', alignItems: 'center', gap: 4,
          }]}>
            {Icon.copy(HA.bgDeep, 12)}
            <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 12 }}>{copied ? 'Copied' : 'Copy'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <MonoLabel>YOUR REWARDS</MonoLabel>
        <View style={{
          marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: HA.surface,
          borderWidth: 1, borderColor: HA.stroke,
          flexDirection: 'row', justifyContent: 'space-between',
        }}>
          <RewardStat label="INVITED" value="0" />
          <RewardStat label="UNLOCKED" value="0" accent={HA.lime} />
          <RewardStat label="EARNED" value="0mo" accent={HA.lime} />
        </View>
      </View>
    </Screen>
  );
}

function RewardStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View>
      <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: HA.inkSoft, letterSpacing: 1 }}>{label}</Text>
      <Text style={{ marginTop: 3, fontFamily: FONT.displayHeavy, fontSize: 22, color: accent || HA.ink, letterSpacing: -0.8 }}>{value}</Text>
    </View>
  );
}
