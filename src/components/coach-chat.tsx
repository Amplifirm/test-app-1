import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { HA, FONT, RADIUS } from '~/design/tokens';
import { Icon } from './atoms';
import { SkeletonChatBubble } from './skeleton';
import { sendCoachMessage, type CoachMessage } from '~/lib/coach';
import { track } from '~/lib/analytics';

export function CoachChat({
  hustleId,
  hustleName,
  week,
  day,
}: {
  hustleId: string;
  hustleName: string;
  week: number;
  day: number;
}) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput('');
    const userMsg: CoachMessage = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    void track('coach_message_sent', { hustleId, week, day });

    const res = await sendCoachMessage(hustleId, hustleName, week, day, messages, text);
    if (res.ok) {
      setMessages((m) => [...m, res.message]);
    } else if (res.error === 'rate_limited') {
      setRateLimited(true);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'You\'ve hit today\'s 5-message limit. Come back tomorrow.' },
      ]);
    } else {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Coach is unreachable right now. Try again in a minute.' },
      ]);
    }
    setBusy(false);
  };

  return (
    <View style={{ marginTop: 20, padding: 14, borderRadius: RADIUS.card, backgroundColor: HA.surface, borderWidth: 1, borderColor: HA.stroke }}>
      <Text style={{ color: HA.lime, fontFamily: FONT.monoBold, fontSize: 10, letterSpacing: 1.2 }}>
        AI COACH · 5/DAY
      </Text>
      <Text style={{ marginTop: 6, color: HA.ink, fontFamily: FONT.bodyBold, fontSize: 15 }}>
        Stuck? Ask a question.
      </Text>

      {messages.length > 0 ? (
        <ScrollView style={{ marginTop: 12, maxHeight: 280 }}>
          {messages.map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                marginTop: 8,
                padding: 10,
                borderRadius: 14,
                backgroundColor: m.role === 'user' ? HA.lime : HA.bgDeep,
                borderWidth: m.role === 'user' ? 0 : 1,
                borderColor: HA.stroke,
              }}
            >
              <Text style={{ color: m.role === 'user' ? HA.bgDeep : HA.ink, fontFamily: FONT.body, fontSize: 13, lineHeight: 19 }}>
                {m.content}
              </Text>
            </View>
          ))}
          {busy ? <SkeletonChatBubble /> : null}
        </ScrollView>
      ) : null}

      <View style={{ marginTop: 12, padding: 4, borderRadius: 12, backgroundColor: HA.bgDeep, borderWidth: 1, borderColor: HA.stroke, flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={rateLimited ? 'Daily limit reached' : 'Type your question…'}
          placeholderTextColor={HA.inkSoft}
          editable={!rateLimited && !busy}
          multiline
          style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 10, color: HA.ink, fontFamily: FONT.body, fontSize: 14, minHeight: 38, maxHeight: 110 }}
        />
        <Pressable
          onPress={send}
          disabled={!input.trim() || busy || rateLimited}
          style={({ pressed }) => ({
            width: 36, height: 36, borderRadius: 99,
            backgroundColor: !input.trim() || rateLimited ? HA.surfaceHi : HA.lime,
            alignItems: 'center', justifyContent: 'center',
            margin: 4, opacity: pressed ? 0.85 : 1,
          })}
        >
          {Icon.arrow(input.trim() ? HA.bgDeep : HA.inkSoft, 16)}
        </Pressable>
      </View>
    </View>
  );
}
