// Minimal markdown-ish renderer for legal text. Handles: h1/h2, paragraphs,
// **bold**, and bullet lists starting with "- ". No links, no inline code,
// no tables — keep this simple so legal text reads cleanly on mobile.

import React from 'react';
import { Text, View } from 'react-native';
import { HA, FONT } from '~/design/tokens';

function renderInline(line: string, key: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text key={key} style={{ color: HA.ink, fontFamily: FONT.body, fontSize: 14, lineHeight: 22 }}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <Text key={i} style={{ fontFamily: FONT.bodyBold }}>{p.slice(2, -2)}</Text>
        ) : (
          <Text key={i}>{p}</Text>
        )
      )}
    </Text>
  );
}

export function LegalText({ source }: { source: string }) {
  const lines = source.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuf: string[] = [];

  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push(
      <View key={`list-${blocks.length}`} style={{ marginTop: 6, marginBottom: 10, gap: 6 }}>
        {listBuf.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: HA.lime, fontFamily: FONT.body, fontSize: 14, lineHeight: 22 }}>•</Text>
            {renderInline(item.replace(/^- /, ''), `li-${i}`)}
          </View>
        ))}
      </View>
    );
    listBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (line.startsWith('# ')) {
      flushList();
      blocks.push(
        <Text key={`h1-${i}`} style={{ marginTop: 8, marginBottom: 4, color: HA.ink, fontFamily: FONT.displayHeavy, fontSize: 28, letterSpacing: -1, lineHeight: 32 }}>
          {line.slice(2)}
        </Text>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      blocks.push(
        <Text key={`h2-${i}`} style={{ marginTop: 18, marginBottom: 6, color: HA.lime, fontFamily: FONT.bodyBold, fontSize: 16 }}>
          {line.slice(3)}
        </Text>
      );
    } else if (line.startsWith('- ')) {
      listBuf.push(line);
    } else if (!line) {
      flushList();
    } else {
      flushList();
      blocks.push(<View key={`p-${i}`} style={{ marginTop: 6 }}>{renderInline(line, `p-i-${i}`)}</View>);
    }
  }
  flushList();
  return <>{blocks}</>;
}
