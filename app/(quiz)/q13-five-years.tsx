import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { FourCardGrid } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q13() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q13 || '';
  return (
    <QuizFrame questionId="q13" back="/(quiz)/q12-pitches" next="/(quiz)/q14-dms" canAdvance={!!value}>
      <FourCardGrid options={OPTS.five} value={value || null} onChange={(v) => set('q13', v)} />
    </QuizFrame>
  );
}
