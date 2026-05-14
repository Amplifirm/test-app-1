import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { PairedCard } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q12() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q12 || '';
  return (
    <QuizFrame questionId="q12" back="/(quiz)/q11-workspace" next="/(quiz)/q13-five-years" canAdvance={!!value}>
      <PairedCard options={OPTS.pitch} value={value || null} onChange={(v) => set('q12', v)} />
    </QuizFrame>
  );
}
