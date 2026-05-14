import React from 'react';
import { ScrollView } from 'react-native';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { ThrillDrain } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q14() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: Record<string, 'thrill' | 'drain'> = answers.q14 || {};
  const can = Object.keys(value).length === OPTS.dms.length;
  return (
    <QuizFrame
      questionId="q14"
      back="/(quiz)/q13-five-years"
      next="/(quiz)/q15-variance"
      canAdvance={can}
      ctaLabel={can ? 'Continue' : `Tag ${OPTS.dms.length - Object.keys(value).length} more`}
    >
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{ flex: 1 }}>
        <ThrillDrain items={OPTS.dms} value={value} onChange={(v) => set('q14', v)} />
      </ScrollView>
    </QuizFrame>
  );
}
