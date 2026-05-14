import * as Haptics from 'expo-haptics';

export const haptic = {
  select: () => Haptics.selectionAsync().catch(() => {}),
  tapLight: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  tapMed: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warn: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};
