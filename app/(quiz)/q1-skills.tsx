import React from 'react';
import { ScrollView } from 'react-native';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { ChipMultiSelect } from '~/components/question-formats';
import { SKILLS } from '~/lib/quiz-schema';

export default function Q1() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string[] = answers.q1 || [];
  const can = value.length >= 3;
  return (
    <QuizFrame
      questionId="q1"
      back="/"
      next="/(quiz)/q2-saturday"
      canAdvance={can}
      ctaLabel={can ? 'Continue' : `Pick ${3 - value.length} more`}
    >
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{ flex: 1 }}>
        <ChipMultiSelect
          options={SKILLS.map((s) => ({ id: s, label: s }))}
          value={value}
          onChange={(v) => set('q1', v)}
        />
      </ScrollView>
    </QuizFrame>
  );
}
