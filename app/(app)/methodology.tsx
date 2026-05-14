import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { HA, FONT } from '~/design/tokens';
import { Screen, TopBar } from '~/components/screen';
import { Row, Stack, Icon } from '~/components/atoms';

const SECTIONS = [
  {
    n: '01', t: 'Frameworks we anchor on',
    b: 'RIASEC (Holland codes — 60 years of career-fit validation), Big Five (Conscientiousness, Extraversion, Openness only — we skip Neuroticism and Agreeableness because they add noise here), and Jobs-To-Be-Done framing for the goal vector. We reject MBTI (statistically discredited), Clifton (paywalled IP), and Enneagram (too subjective for matching).',
  },
  {
    n: '02', t: 'How fit % is computed',
    b: 'Your answers produce a 17-axis vector. Each of 30 hustles has its own 17-axis fingerprint. We compute per-family cosine similarity (goal weighted 40%, RIASEC 30%, personality 15%, skill overlap 15%), then map raw similarity (≈0.4–1.0) onto a display range of 60–98%.',
  },
  {
    n: '03', t: 'Hard filters before scoring',
    b: 'Your hours/week, budget, and "won\'t do" blockers are filters, not scores. A hustle that requires 12 hrs/wk is excluded entirely if you said 5. Same for budget and blockers. This is why some hustles never appear in your top 3 — they were filtered before the comparison.',
  },
  {
    n: '04', t: 'Where the WHY bullets come from',
    b: 'For each match, we rank which dimensions contributed most to the score, then pull templated copy that quotes your actual answer string back. Your top 3 also get one "lost-points" bullet — honest about what would have ranked them higher.',
  },
  {
    n: '05', t: 'MRR projections',
    b: 'The monthly figure is the median of comparable launches in the niche over the last 24 months, with a 30% downside band. We show median, not best-case. Your results will vary based on execution.',
  },
  {
    n: '06', t: 'Where this falls short',
    b: 'Execution dominates. A 96% match with a flaky operator beats no operator at all — but loses to a 70% match who actually ships. We model paths, not people.',
  },
];

export default function MethodologyScreen() {
  const router = useRouter();
  return (
    <Screen>
      <TopBar onBack={() => router.back()} label="Methodology" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 32, color: HA.ink, letterSpacing: -1.6, lineHeight: 34 }}>
          How we <Text style={{ color: HA.lime }}>calculate</Text> this.
        </Text>
        <Text style={{ marginTop: 12, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
          No black box. Here's the math — and where it can go wrong.
        </Text>

        <Stack gap={12} style={{ marginTop: 20 }}>
          {SECTIONS.map((s) => (
            <View key={s.n} style={{ padding: 14, borderRadius: 14, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
              <Row gap={10} style={{ marginBottom: 6 }}>
                <Text style={{ fontFamily: FONT.monoBold, fontSize: 11, color: HA.lime, letterSpacing: 0.8 }}>{s.n}</Text>
                <Text style={{ flex: 1, fontFamily: FONT.bodyBold, fontSize: 15, color: HA.ink, letterSpacing: -0.2 }}>{s.t}</Text>
              </Row>
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.body, fontSize: 13, lineHeight: 19 }}>{s.b}</Text>
            </View>
          ))}
        </Stack>

        <View style={{ marginTop: 20, padding: 14, borderRadius: 12, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke }}>
          <Row gap={10}>
            {Icon.lock(HA.lime)}
            <Text style={{ flex: 1, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 12, lineHeight: 18 }}>
              Quiz answers live on-device only. We never sell data. Models retrain monthly.
            </Text>
          </Row>
        </View>
      </ScrollView>
    </Screen>
  );
}
