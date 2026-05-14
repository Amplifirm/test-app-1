import { Stack } from 'expo-router';
import { HA } from '~/design/tokens';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: HA.bg },
      }}
    />
  );
}
