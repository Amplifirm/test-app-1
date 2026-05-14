import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { PairedCard } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q7() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q7 || '';
  return (
    <QuizFrame questionId="q7" back="/(quiz)/q6-calls" next="/(quiz)/q8-camera" canAdvance={!!value}>
      <PairedCard options={OPTS.timing} value={value || null} onChange={(v) => set('q7', v)} />
    </QuizFrame>
  );
}
