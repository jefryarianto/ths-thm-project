import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onTokenRefresh } from './src/lib/notificationService';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import AnggotaDashboard from './screens/anggota/Dashboard';
import ProfileScreen from './screens/anggota/ProfileScreen';
import KartuDigitalScreen from './screens/anggota/KartuDigitalScreen';
import SertifikatScreen from './screens/anggota/SertifikatScreen';
import PiagamScreen from './screens/anggota/PiagamScreen';
import IuranScreen from './screens/anggota/IuranScreen';
import ClaimScreen from './screens/anggota/ClaimScreen';
import PustakaScreen from './screens/anggota/PustakaScreen';
import BeritaScreen from './screens/anggota/BeritaScreen';
import StrukturOrganisasiScreen from './screens/anggota/StrukturOrganisasiScreen';
import PelatihDashboard from './screens/pelatih/Dashboard';
import LaporanLatihanScreen from './screens/pelatih/LaporanLatihanScreen';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AnggotaTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'KartuDigital') iconName = focused ? 'card' : 'card-outline';
          else if (route.name === 'Iuran') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e3a5f',
        tabBarInactiveTintColor: '#94a3b8',
        headerStyle: { backgroundColor: '#1e3a5f' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Dashboard" component={AnggotaDashboard} options={{ title: 'Beranda' }} />
      <Tab.Screen name="KartuDigital" component={KartuDigitalScreen} options={{ title: 'Kartu Digital' }} />
      <Tab.Screen name="Iuran" component={IuranScreen} options={{ title: 'Iuran' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

function PelatihTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1e3a5f',
        tabBarInactiveTintColor: '#94a3b8',
        headerStyle: { backgroundColor: '#1e3a5f' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen name="Dashboard" component={PelatihDashboard} options={{ title: 'Beranda' }} />
      <Tab.Screen name="LaporanLatihan" component={LaporanLatihanScreen} options={{ title: 'Laporan Latihan' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'AnggotaMain' | 'PelatihMain'>('Login');

  useEffect(() => {
    // Check stored session and determine initial route
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
          const user = JSON.parse(userData);
          setInitialRoute(user.role === 'pelatih' ? 'PelatihMain' : 'AnggotaMain');
        }
      } catch {
        // Ignore, go to login
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    // Listen for FCM token refresh events and auto-re-register with backend
    let cancelled = false;
    let unsubscribe: () => void = () => {};
    onTokenRefresh().then((unsub) => {
      if (!cancelled) unsubscribe = unsub;
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Show splash/loading screen while app initializes
  if (!appReady) {
    return (
      <SafeAreaProvider>
        <View style={splashStyles.container}>
          <Image
            source={require('./assets/logo.png')}
            style={splashStyles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#fff" style={splashStyles.spinner} />
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AnggotaMain" component={AnggotaTabs} />
            <Stack.Screen name="PelatihMain" component={PelatihTabs} />
            <Stack.Screen name="Sertifikat" component={SertifikatScreen} options={{ headerShown: true, title: 'Sertifikat', headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Piagam" component={PiagamScreen} options={{ headerShown: true, title: 'Piagam Prestasi', headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Claim" component={ClaimScreen} options={{ headerShown: true, title: 'Klaim Keanggotaan', headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Pustaka" component={PustakaScreen} options={{ headerShown: true, title: 'Pustaka', headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Berita" component={BeritaScreen} options={{ headerShown: true, title: 'Berita & Artikel', headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="StrukturOrganisasi" component={StrukturOrganisasiScreen} options={{ headerShown: true, title: 'Struktur Organisasi', headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 150,
  },
  spinner: {
    marginTop: 32,
  },
});
