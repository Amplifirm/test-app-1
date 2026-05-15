import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from '@expo-google-fonts/geist';
import {
  GeistMono_500Medium,
  GeistMono_600SemiBold,
} from '@expo-google-fonts/geist-mono';
import { useApp } from '~/lib/store';
import { HA } from '~/design/tokens';
import { initializeAnalytics, track } from '~/lib/analytics';
import { initializeSentry } from '~/lib/sentry';
import { initializePurchases } from '~/lib/purchases';
import { initializeSuperwall } from '~/lib/superwall';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Initialize observability + services before render (no top-level await in RN).
initializeSentry();
void initializeAnalytics();
void initializePurchases();
void initializeSuperwall();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
  });

  const hydrated = useApp.persist.hasHydrated();

  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync().catch(() => {});
      void track('app_opened');
    }
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: HA.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            contentStyle: { backgroundColor: HA.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/intro" />
          <Stack.Screen name="onboarding/calibrate" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(quiz)" />
          <Stack.Screen name="results" />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="playbook/[slug]" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="legal/terms" />
          <Stack.Screen name="legal/privacy" />
          <Stack.Screen name="settings/data" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
