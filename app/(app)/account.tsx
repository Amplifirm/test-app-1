import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Row, Stack, Tag, Dot, Icon, CTA, CTAOutline, MonoLabel } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { HUSTLES } from '~/lib/hustles';
import { restorePurchases } from '~/lib/purchases';
import { track } from '~/lib/analytics';

const VERSION = `${Constants.expoConfig?.version ?? '1.0.0'} (${Constants.expoConfig?.runtimeVersion ?? 'dev'})`;
const MANAGE_SUBSCRIPTION_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  default: 'https://apps.apple.com/account/subscriptions',
});

export default function AccountScreen() {
  const router = useRouter();
  const email = useApp((s) => s.email);
  const setEmail = useApp((s) => s.setEmail);
  const unlocks = useApp((s) => s.unlocks);

  if (!email) return <EmailCapture onSaved={(e) => setEmail(e)} onBack={() => router.back()} />;

  const unlocked = HUSTLES.filter((h) => unlocks.includes('__all__') || unlocks.includes(h.slug));

  return (
    <Screen>
      <TopBar
        onBack={() => router.back()}
        label="Your playbooks"
        right={<View style={{ width: 32, height: 32, borderRadius: 99, backgroundColor: HA.coral, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: FONT.displayHeavy, fontSize: 12 }}>{email.slice(0, 2).toUpperCase()}</Text>
        </View>}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke,
          flexDirection: 'row', justifyContent: 'space-between',
        }}>
          <BigStat label="UNLOCKED" value={String(unlocked.length)} />
          <BigStat label="ACTIVE" value={String(Math.min(unlocked.length, 2))} accent={HA.lime} />
          <BigStat label="EARNED" value="$0" />
        </View>

        <Text style={{ marginTop: 22, fontFamily: FONT.displayHeavy, fontSize: 24, color: HA.ink, letterSpacing: -1 }}>
          {unlocked.length} unlocked.
        </Text>

        <Stack gap={10} style={{ marginTop: 12 }}>
          {unlocked.map((h) => (
            <View key={h.id} style={{ padding: 12, borderRadius: 12, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
              <Row justify="space-between">
                <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15 }}>{h.title}</Text>
                <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime}>
                  <Dot size={5} color={HA.lime} />
                  <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, marginLeft: 4, letterSpacing: 1 }}>LIVE</Text>
                </Tag>
              </Row>
              <View style={{ height: 5, borderRadius: 99, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke, marginTop: 10 }}>
                <View style={{ height: '100%', width: '20%', backgroundColor: HA.lime, borderRadius: 99 }} />
              </View>
              <Row justify="space-between" style={{ marginTop: 8 }}>
                <Text style={{ color: HA.inkMuted, fontFamily: FONT.mono, fontSize: 11 }}>Day 12 of 90</Text>
                <Text style={{ color: HA.ink, fontFamily: FONT.mono, fontSize: 11 }}>$0 / {h.monthly}</Text>
              </Row>
            </View>
          ))}
          {unlocked.length === 0 ? (
            <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13 }}>No unlocks yet.</Text>
          ) : null}
        </Stack>

        <View style={{ gap: 10, marginTop: 22 }}>
          <SettingsRow label="Quiz again" sub="Replaces your current matches" onPress={() => {
            Alert.alert('Retake the quiz?', 'This will replace your current matches.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Replace', style: 'destructive', onPress: () => { useApp.getState().resetQuiz(); router.replace('/'); } },
            ]);
          }} />
          <SettingsRow label="Refer friends" sub="Earn free months" onPress={() => router.push('/(app)/referrals' as any)} />
          <SettingsRow label="Restore purchases" onPress={async () => {
            void track('restore_purchases_attempted');
            const { count } = await restorePurchases();
            Alert.alert(count > 0 ? 'Restored' : 'Nothing to restore', count > 0 ? `Restored ${count} entitlement(s).` : 'No prior purchases found on this Apple/Google ID.');
          }} />
          <SettingsRow label="Manage subscription" sub="Opens App Store / Play Store" onPress={() => Linking.openURL(MANAGE_SUBSCRIPTION_URL)} />
          <SettingsRow label="Privacy & data" sub="Export · Delete" onPress={() => router.push('/settings/data' as any)} />
          <SettingsRow label="Methodology" onPress={() => router.push('/(app)/methodology' as any)} />
          <SettingsRow label="Terms" onPress={() => router.push('/legal/terms' as any)} />
          <SettingsRow label="Privacy policy" onPress={() => router.push('/legal/privacy' as any)} />
          <SettingsRow label="Contact support" sub="support@hustleai.com" onPress={() => Linking.openURL('mailto:support@hustleai.com?subject=HustleAI%20support')} />
        </View>

        <Text style={{ marginTop: 22, color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 11, textAlign: 'center', letterSpacing: 1 }}>
          v{VERSION}
        </Text>
      </ScrollView>
    </Screen>
  );
}

function SettingsRow({ label, sub, onPress }: { label: string; sub?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 14,
        borderRadius: 12,
        backgroundColor: HA.surface,
        borderWidth: 1,
        borderColor: HA.stroke,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Row justify="space-between">
        <View style={{ flex: 1 }}>
          <Text style={{ color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 14 }}>{label}</Text>
          {sub ? <Text style={{ marginTop: 2, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12 }}>{sub}</Text> : null}
        </View>
        <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 16 }}>›</Text>
      </Row>
    </Pressable>
  );
}

function BigStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View>
      <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: HA.inkSoft, letterSpacing: 1 }}>{label}</Text>
      <Text style={{ marginTop: 3, fontFamily: FONT.displayHeavy, fontSize: 22, color: accent || HA.ink, letterSpacing: -0.8 }}>{value}</Text>
    </View>
  );
}

function EmailCapture({ onSaved, onBack }: { onSaved: (e: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState('');
  return (
    <Screen>
      <TopBar onBack={onBack} label="Save your playbook" />
      <View style={{ flex: 1 }}>
        <Tag color={HA.lime} bg={HA.limeSoft} border={HA.strokeLime} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          {Icon.check(HA.lime, 11)}
          <Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, marginLeft: 4, letterSpacing: 1 }}>JUST UNLOCKED</Text>
        </Tag>
        <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 36, color: HA.ink, letterSpacing: -1.8, lineHeight: 38 }}>
          Save it. <Text style={{ color: HA.lime }}>Come back.</Text>{'\n'}Track every day.
        </Text>
        <Text style={{ marginTop: 12, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
          Drop your email — we'll keep your playbook, progress, and weekly new matches. No password. Magic link only.
        </Text>

        <View style={{
          marginTop: 22, padding: 4, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke,
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={HA.inkSoft}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, color: HA.ink, fontFamily: FONT.body, fontSize: 15 }}
          />
          <View style={{ width: 110 }}>
            <CTA onPress={() => email.includes('@') && onSaved(email)}>
              <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 13 }}>Send link</Text>
            </CTA>
          </View>
        </View>
        <Row gap={6} style={{ marginTop: 10 }}>
          {Icon.lock(HA.inkSoft)}
          <Text style={{ color: HA.inkSoft, fontFamily: FONT.body, fontSize: 11 }}>No password. No spam.</Text>
        </Row>
      </View>
    </Screen>
  );
}
