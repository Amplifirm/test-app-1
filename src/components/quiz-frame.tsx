import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { HA, FONT } from '~/design/tokens';
import { Screen, CTADock, TopBar, SignalCounter, ObservationToast } from './screen';
import { CTA, CTAOutline, Row, Icon } from './atoms';
import { useApp } from '~/lib/store';
import { QUESTIONS, getQuestion, SNAP_QUESTIONS } from '~/lib/quiz-schema';

export function QuizFrame({
  questionId,
  back,
  next,
  canAdvance = true,
  ctaLabel,
  skippable = false,
  onSkip,
  children,
  hideObservation = false,
}: {
  questionId: string;
  back?: string;
  next: string;
  canAdvance?: boolean;
  ctaLabel?: string;
  skippable?: boolean;
  onSkip?: () => void;
  children: ReactNode;
  hideObservation?: boolean;
}) {
  const router = useRouter();
  const q = getQuestion(questionId)!;
  const answers = useApp((s) => s.answers);
  const captured = QUESTIONS.filter((x) => answers[x.id] !== undefined && answers[x.id] !== null).length;

  const snapTotal = SNAP_QUESTIONS.length;
  const step = q.index;
  const isSnap = q.phase === 'snap';
  const totalDots = isSnap ? snapTotal : snapTotal + 7;

  // Observation toast: fire after q5 and q13
  const showObservation =
    !hideObservation && (
      (q.index === 6 && answers.q5 === 'fifty') ||
      (q.index === 6 && answers.q5 === 'one3k') ||
      (q.index === 14 && answers.q13 === 'team')
    );
  const observationMessage =
    answers.q5 === 'fifty' && q.index === 6
      ? 'People who picked "$19 from 50 people" most often top-match content + digital products. Calibrating…'
      : answers.q5 === 'one3k' && q.index === 6
      ? 'Most "one $3k client" people land in done-for-you services. Calibrating…'
      : q.index === 14 && answers.q13 === 'team'
      ? 'Team-leaning answers re-weight toward micro-SaaS and agency. Calibrating…'
      : '';

  return (
    <Screen>
      <TopBar
        onBack={back ? () => router.replace(back as any) : undefined}
        step={step}
        total={totalDots}
        label={isSnap ? `${q.index} of ${snapTotal}` : `Deep ${q.index - snapTotal} of 7`}
        right={<SignalCounter captured={captured} total={17} />}
      />

      {showObservation ? <ObservationToast visible={true} message={observationMessage} /> : null}

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.displayHeavy, fontSize: 30, lineHeight: 34, letterSpacing: -1.2, color: HA.ink }}>
          {renderPromptWithLime(q.prompt)}
        </Text>
        {q.subPrompt ? (
          <Text style={{ marginTop: 10, color: HA.inkMuted, fontFamily: FONT.body, fontSize: 14, lineHeight: 20 }}>
            {q.subPrompt}
          </Text>
        ) : null}

        <View style={{ marginTop: 22, flex: 1 }}>
          {children}
        </View>
      </View>

      <CTADock padH={0}>
        <CTA onPress={() => router.replace(next as any)} disabled={!canAdvance} hapticKind="tapMed">
          <Text style={{ color: canAdvance ? HA.bgDeep : HA.inkSoft, fontFamily: FONT.bodyBold, fontSize: 17 }}>
            {ctaLabel || 'Continue'}
          </Text>
          {Icon.arrow(canAdvance ? HA.bgDeep : HA.inkSoft)}
        </CTA>
        {skippable ? (
          <View style={{ marginTop: 10 }}>
            <CTAOutline onPress={() => { onSkip?.(); router.replace(next as any); }}>
              <Text style={{ color: HA.inkMuted, fontFamily: FONT.bodyMed, fontSize: 14 }}>Skip — I’m flexible</Text>
            </CTAOutline>
          </View>
        ) : null}
      </CTADock>
    </Screen>
  );
}

// Render the second-to-last "interesting" word in lime (cheap: highlight the first italic-y word
// in the markup pattern <lime>word</lime> via a tiny token. We just pass plain strings for now.)
function renderPromptWithLime(text: string) {
  // We don't have markup — just return as-is.
  return text;
}
