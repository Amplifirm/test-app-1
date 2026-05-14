import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { ChipMultiSelect } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q10() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string[] = answers.q10 || [];
  return (
    <QuizFrame
      questionId="q10"
      back="/(quiz)/q9-commit"
      next="/(quiz)/upgrade"
      canAdvance
      ctaLabel="Continue"
      skippable
      onSkip={() => set('q10', [])}
    >
      <ChipMultiSelect options={OPTS.blocker} value={value} onChange={(v) => set('q10', v)} />
    </QuizFrame>
  );
}
