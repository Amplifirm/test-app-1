import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { ChartPicker } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q16() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q16 || '';
  return (
    <QuizFrame questionId="q16" back="/(quiz)/q15-variance" next="/(quiz)/q17-why-now" canAdvance={!!value}>
      <ChartPicker options={OPTS.effort} value={value || null} onChange={(v) => set('q16', v)} />
    </QuizFrame>
  );
}
