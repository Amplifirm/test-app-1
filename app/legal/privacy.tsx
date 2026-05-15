import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { PRIVACY } from './_text';
import { LegalText } from './_renderer';

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <Screen>
      <TopBar onBack={() => router.back()} label="Privacy" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ marginBottom: 12, padding: 12, borderRadius: 10, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.coral }}>
          <Text style={{ color: HA.coral, fontFamily: FONT.monoBold, fontSize: 10, letterSpacing: 1 }}>
            TEMPLATE — REVIEW BY LAWYER BEFORE LAUNCH
          </Text>
        </View>
        <LegalText source={PRIVACY} />
      </ScrollView>
    </Screen>
  );
}
