import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { FourCardGrid } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q11() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q11 || '';
  return (
    <QuizFrame questionId="q11" back="/(quiz)/upgrade" next="/(quiz)/q12-pitches" canAdvance={!!value}>
      <FourCardGrid options={OPTS.workspace} value={value || null} onChange={(v) => set('q11', v)} />
    </QuizFrame>
  );
}
