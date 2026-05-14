import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { HA, FONT } from '~/design/tokens';
import { Screen, CTADock, TopBar } from '~/components/screen';
import { CTA, CTAOutline, Row, Tag, Dot, Icon, MonoLabel } from '~/components/atoms';
import { ConfidenceBand } from '~/components/screen';
import { useApp } from '~/lib/store';
import { SNAP_QUESTIONS, QUESTIONS } from '~/lib/quiz-schema';

export default function UpgradeGate() {
  const router = useRouter();
  const answers = useApp((s) => s.answers);
  const captured = QUESTIONS.filter((x) => answers[x.id] !== undefined && answers[x.id] !== null).length;

  return (
    <Screen>
      <TopBar
        label="Halfway gate"
        right={<Tag color={HA.lime} border={HA.strokeLime}><Dot size={5} color={HA.lime} /><Text style={{ color: HA.lime, fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1 }}>LIVE</Text></Tag>}
      />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 40, color: HA.ink, letterSpacing: -1.8, lineHeight: 42 }}>
          Snap quiz <Text style={{ color: HA.lime }}>complete</Text>.
        </Text>
        <Text style={{ marginTop: 14, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 15, lineHeight: 22 }}>
          You can match now with medium confidence — or answer 7 more (~35 seconds) for high-confidence matches.
        </Text>

        <View style={{ marginTop: 22 }}>
          <ConfidenceBand confidence="medium" captured={captured} total={17} />
        </View>

        {/* What deep-dive adds */}
        <View style={{ marginTop: 22, padding: 16, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
          <MonoLabel color={HA.lime}>Deep-dive adds</MonoLabel>
          <View style={{ gap: 8, marginTop: 10 }}>
            {[
              'Workspace fingerprint → re-weights RIASEC',
              'Risk variance → unlocks high-ceiling matches',
              'Effort curve → sprint vs sustained gating',
              'DM thrill/drain → live empathy axis',
            ].map((b) => (
              <Row key={b} gap={8}>
                <View style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: HA.lime, alignItems: 'center', justifyContent: 'center' }}>
                  {Icon.check(HA.bgDeep, 10)}
                </View>
                <Text style={{ flex: 1, color: HA.ink, fontFamily: FONT.body, fontSize: 13 }}>{b}</Text>
              </Row>
            ))}
          </View>
        </View>
      </View>

      <CTADock padH={0}>
        <CTA onPress={() => router.replace('/(quiz)/q11-workspace')} hapticKind="tapMed">
          <Text style={{ color: HA.bgDeep, fontFamily: FONT.bodyBold, fontSize: 17 }}>Upgrade to HIGH</Text>
          {Icon.arrow(HA.bgDeep)}
        </CTA>
        <View style={{ marginTop: 10 }}>
          <CTAOutline onPress={() => router.replace('/(quiz)/thinking')}>
            <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 14 }}>Match me now (medium)</Text>
          </CTAOutline>
        </View>
      </CTADock>
    </Screen>
  );
}
