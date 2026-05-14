import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { ChipMultiSelect } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q3() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string[] = answers.q3 || [];
  const can = value.length >= 1;

  return (
    <QuizFrame questionId="q3" back="/(quiz)/q2-saturday" next="/(quiz)/q4-shipping" canAdvance={can}>
      <ChipMultiSelect options={OPTS.inbox} value={value} max={3} onChange={(v) => set('q3', v)} />
    </QuizFrame>
  );
}
