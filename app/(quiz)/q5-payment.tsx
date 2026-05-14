import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { FourCardGrid } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q5() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q5 || '';
  return (
    <QuizFrame questionId="q5" back="/(quiz)/q4-shipping" next="/(quiz)/q6-calls" canAdvance={!!value}>
      <FourCardGrid options={OPTS.payment} value={value || null} onChange={(v) => set('q5', v)} />
    </QuizFrame>
  );
}
