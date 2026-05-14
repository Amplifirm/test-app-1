import React, { useEffect } from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { RankList } from '~/components/question-formats';
import { getQuestion } from '~/lib/quiz-schema';

export default function Q2() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const q = getQuestion('q2')!;
  const value: string[] = answers.q2 || q.options!.map((o) => o.id);

  // Initialize order on first render
  useEffect(() => {
    if (!answers.q2) set('q2', q.options!.map((o) => o.id));
  }, []);

  return (
    <QuizFrame
      questionId="q2"
      back="/(quiz)/q1-skills"
      next="/(quiz)/q3-inbox"
      canAdvance
    >
      <RankList
        options={q.options!}
        value={value}
        onChange={(v) => set('q2', v)}
      />
    </QuizFrame>
  );
}
