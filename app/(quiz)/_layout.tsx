import { Stack } from 'expo-router';
import { HA } from '~/design/tokens';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: HA.bg },
      }}
    >
      <Stack.Screen name="thinking" options={{ presentation: 'containedTransparentModal', animation: 'fade_from_bottom', gestureEnabled: false }} />
    </Stack>
  );
}
