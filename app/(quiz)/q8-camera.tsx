import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { SingleCardList } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q8() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q8 || '';
  return (
    <QuizFrame questionId="q8" back="/(quiz)/q7-timing" next="/(quiz)/checkpoint-2" canAdvance={!!value}>
      <SingleCardList options={OPTS.camera} value={value || null} onChange={(v) => set('q8', v)} />
    </QuizFrame>
  );
}
