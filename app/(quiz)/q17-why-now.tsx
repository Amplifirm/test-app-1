import React from 'react';
import { useApp } from '~/lib/store';
import { QuizFrame } from '~/components/quiz-frame';
import { ChipMultiSelect } from '~/components/question-formats';
import { OPTS } from '~/lib/quiz-schema';

export default function Q17() {
  const answers = useApp((s) => s.answers);
  const set = useApp((s) => s.setAnswer);
  const value: string[] = answers.q17 || [];
  return (
    <QuizFrame
      questionId="q17"
      back="/(quiz)/q16-effort"
      next="/(quiz)/thinking"
      canAdvance
      ctaLabel="Match me"
      skippable
      onSkip={() => set('q17', [])}
    >
      <ChipMultiSelect options={OPTS.why} value={value} onChange={(v) => set('q17', v)} />
    </QuizFrame>
  );
}
