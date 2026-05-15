import React from 'react';
import { View } from 'react-native';
import { HA } from '~/design/tokens';

// Segmented 12-week progress bar with milestone dots at week 4, 8, 12.
// Each segment fills as the corresponding week's days are completed.
export function PlaybookProgressBar({
  currentDay,
  completedDayIds,
  milestonesHit,
}: {
  currentDay: number;
  completedDayIds: number[];
  milestonesHit: number[]; // weeks already celebrated
}) {
  const completedSet = new Set(completedDayIds);

  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 12 }).map((_, idx) => {
        const week = idx + 1;
        const weekStart = idx * 7 + 1;
        const weekEnd = Math.min(week * 7, 90);
        let completedInWeek = 0;
        for (let d = weekStart; d <= weekEnd; d++) if (completedSet.has(d)) completedInWeek++;
        const totalInWeek = weekEnd - weekStart + 1;
        const fillPct = completedInWeek / totalInWeek;
        const isMilestoneWeek = week === 4 || week === 8 || week === 12;
        const milestoneHit = milestonesHit.includes(week);
        const isCurrent = currentDay >= weekStart && currentDay <= weekEnd;

        return (
          <View key={week} style={{ flex: 1, height: 8, position: 'relative' }}>
            <View
              style={{
                position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                borderRadius: 4,
                backgroundColor: HA.surfaceHi,
                borderWidth: isCurrent ? 1 : 0,
                borderColor: HA.strokeLime,
              }}
            />
            <View
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${Math.round(fillPct * 100)}%`,
                borderRadius: 4,
                backgroundColor: HA.lime,
              }}
            />
            {isMilestoneWeek ? (
              <View
                style={{
                  position: 'absolute',
                  right: -2,
                  top: -2,
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  backgroundColor: milestoneHit ? HA.lime : HA.inkSoft,
                  borderWidth: 1.5,
                  borderColor: HA.bg,
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
