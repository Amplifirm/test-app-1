import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { Screen, TopBar, CTADock } from '~/components/screen';
import { CTA, CTAOutline, MonoLabel } from '~/components/atoms';
import { useApp } from '~/lib/store';
import { getDeviceId, getCurrentUser, signOut } from '~/lib/auth';
import { getEntitlements, deleteOwnProfile } from '~/lib/db';
import { track } from '~/lib/analytics';
import { reset as resetAnalytics } from '~/lib/analytics';

export default function DataScreen() {
  const router = useRouter();
  const resetAll = useApp((s) => s.resetAll);
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);

  const handleExport = async () => {
    if (busy) return;
    setBusy('export');
    try {
      const [deviceId, user, store] = await Promise.all([
        getDeviceId(),
        getCurrentUser(),
        Promise.resolve(useApp.getState()),
      ]);
      const entitlements = user ? await getEntitlements({ deviceId, profileId: user.id }) : [];
      const payload = {
        exportedAt: new Date().toISOString(),
        device: { deviceId },
        profile: user ?? null,
        local: {
          answers: store.answers,
          email: store.email,
          unlocks: store.unlocks,
        },
        entitlements,
      };
      const json = JSON.stringify(payload, null, 2);
      await Clipboard.setStringAsync(json);
      Alert.alert(
        'Copied to clipboard',
        `${(json.length / 1024).toFixed(1)} KB of your data is on the clipboard. Paste it anywhere you want to keep it (Notes, email, etc.).`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      if (__DEV__) console.warn('[settings/data] export failed', e);
      Alert.alert('Export failed', 'Try again in a moment.');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    Alert.alert(
      'Delete your account?',
      'This removes your profile, quiz answers, matches, playbook progress, and entitlement records. Apple/Google subscription cancellation is separate — manage that in your platform settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy('delete');
            try {
              void track('account_deleted');
              const user = await getCurrentUser();
              if (user) await deleteOwnProfile(user.id);
              else await signOut();
              resetAll();
              resetAnalytics();
              router.replace('/');
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <TopBar onBack={() => router.back()} label="Privacy & data" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <MonoLabel color={HA.lime}>EXPORT</MonoLabel>
        <Text style={{ marginTop: 8, color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 21 }}>
          Generate a JSON export of everything we have on you: profile, quiz answers, axis scores, entitlements, and local app state.
        </Text>
        <View style={{ marginTop: 14 }}>
          <CTAOutline onPress={handleExport}>Export my data (JSON)</CTAOutline>
        </View>

        <View style={{ marginTop: 30, padding: 14, borderRadius: RADIUS.card, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          <MonoLabel color={HA.coral}>DELETE</MonoLabel>
          <Text style={{ marginTop: 8, color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 21 }}>
            Permanently delete your profile from our servers. Local app cache is also cleared. Subscriptions must be cancelled separately via Apple / Google — we cannot do that for you.
          </Text>
          <Text style={{ marginTop: 8, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, lineHeight: 18 }}>
            We retain a minimal audit-log record for 30 days after deletion to comply with billing reconciliation, then it's purged.
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <CTAOutline onPress={() => Linking.openURL('mailto:privacy@hustleai.com?subject=HustleAI%20data%20request')}>
            Email privacy@hustleai.com instead
          </CTAOutline>
        </View>
      </ScrollView>
      <CTADock padH={0}>
        <CTA
          onPress={handleDelete}
          disabled={busy !== null}
          bg={HA.coral}
          fg="#fff"
        >
          <Text style={{ color: '#fff', fontFamily: FONT.bodyBold, fontSize: 16 }}>
            {busy === 'delete' ? 'Deleting…' : 'Delete my account'}
          </Text>
        </CTA>
      </CTADock>
    </Screen>
  );
}
