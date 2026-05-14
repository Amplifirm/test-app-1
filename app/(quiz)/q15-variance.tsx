import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { PairedCard } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q15() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q15 || '';
  return (
    <QuizFrame questionId="q15" back="/(quiz)/q14-dms" next="/(quiz)/q16-effort" canAdvance={!!value}>
      <PairedCard options={OPTS.variance} value={value || null} onChange={(v) => set('q15', v)} />
    </QuizFrame>
  );
}
