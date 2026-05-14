import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { RangeSlider } from '~/components/question-formats';
import { HA, FONT } from '~/design/tokens';
import { Row, MonoLabel } from '~/components/atoms';
import { BUDGET_TIERS } from '~/lib/quiz-schema';

export default function Q9() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const cur = answers.q9 || { hours: 8, budget: 200 };

  const setH = (hours: number) => set('q9', { ...cur, hours });
  const setB = (budget: number) => set('q9', { ...cur, budget });
  const can = !!answers.q9 || true; // always allowed since slider/budget have defaults

  return (
    <QuizFrame questionId="q9" back="/(quiz)/q8-camera" next="/(quiz)/q10-blockers" canAdvance={can} ctaLabel="Continue">
      <View style={{ gap: 22 }}>
        {/* Hours */}
        <View>
          <Row justify="space-between" align="flex-end" style={{ marginBottom: 8 }}>
            <MonoLabel>Hours / week</MonoLabel>
            <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 42, color: HA.lime, letterSpacing: -1.5, lineHeight: 42 }}>
              {cur.hours}
              <Text style={{ fontSize: 13, color: HA.inkMuted, fontFamily: FONT.bodyMed, letterSpacing: 0 }}> hrs</Text>
            </Text>
          </Row>
          <RangeSlider min={2} max={40} step={1} value={cur.hours} onChange={setH} />
          <Row justify="space-between" style={{ marginTop: 4 }}>
            <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 11 }}>2</Text>
            <Text style={{ color: HA.inkSoft, fontFamily: FONT.mono, fontSize: 11 }}>40</Text>
          </Row>
        </View>

        {/* Budget */}
        <View>
          <MonoLabel>Starting budget</MonoLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {BUDGET_TIERS.map((b) => {
              const on = cur.budget === b.v;
              return (
                <Pressable
                  key={b.v}
                  onPress={() => setB(b.v)}
                  style={({ pressed }) => [{
                    width: '47.5%', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5,
                    borderColor: on ? HA.lime : HA.stroke, backgroundColor: on ? HA.limeSoft : HA.surface,
                    opacity: pressed ? 0.9 : 1,
                  }]}
                >
                  <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 26, color: on ? HA.lime : HA.ink, letterSpacing: -1 }}>{b.label}</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: HA.inkMuted, marginTop: 4 }}>{b.sub}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </QuizFrame>
  );
}
