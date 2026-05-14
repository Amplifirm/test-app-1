import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { SingleCardList } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q6() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string = answers.q6 || '';
  return (
    <QuizFrame questionId="q6" back="/(quiz)/q5-payment" next="/(quiz)/q7-timing" canAdvance={!!value}>
      <SingleCardList options={OPTS.calls} value={value || null} onChange={(v) => set('q6', v)} />
    </QuizFrame>
  );
}
