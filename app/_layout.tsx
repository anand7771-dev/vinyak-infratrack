import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { auth } from '../services/firebase';
import { fetchUserProfile } from '../services/authService';
import { Colors } from '../constants/Colors';
import LockScreen from '../components/LockScreen';

// Custom Paper theme
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.bgDark,
    surface: '#FFFFFF',
    background: Colors.bgScreen,
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primaryLight,
    secondary: Colors.primaryLight,
    surface: Colors.dark.card,
    background: Colors.dark.bg,
  },
};

export default function RootLayout() {
  const { setUser, setFirebaseUser, setLoading, clearAuth, isAuthenticated } = useAuthStore();
  const { isDarkMode, appLockEnabled } = useAppStore();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const theme = isDarkMode ? customDarkTheme : customLightTheme;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFirebaseUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        try {
          const profile = await fetchUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch (e) {
          // Offline: use cached user from Zustand persist
        }
        router.replace('/(tabs)');
      } else {
        clearAuth();
        router.replace('/(auth)/login');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="project/[id]" />
          <Stack.Screen name="project/add" />
          <Stack.Screen name="income/add" />
          <Stack.Screen name="expense/add" />
          <Stack.Screen name="admin/index" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="notifications" />
        </Stack>

        {isAuthenticated && appLockEnabled && !isUnlocked && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
            <LockScreen onUnlock={() => setIsUnlocked(true)} />
          </View>
        )}
      </View>
    </PaperProvider>
  );
}
