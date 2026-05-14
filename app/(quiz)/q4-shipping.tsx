import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { SingleCardList } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q4() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q4 || '';

  return (
    <QuizFrame questionId="q4" back="/(quiz)/q3-inbox" next="/(quiz)/checkpoint-1" canAdvance={!!value}>
      <SingleCardList options={OPTS.shipping} value={value || null} onChange={(v) => set('q4', v)} />
    </QuizFrame>
  );
}
