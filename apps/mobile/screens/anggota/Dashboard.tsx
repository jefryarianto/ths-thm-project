import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unregisterDeviceToken } from '../../src/lib/notificationService';

const menuItems = [
  { icon: 'card-outline' as const, label: 'Kartu Digital', route: 'KartuDigital', color: '#0891b2' },
  { icon: 'ribbon-outline' as const, label: 'Sertifikat', route: 'Sertifikat', color: '#7c3aed' },
  { icon: 'trophy-outline' as const, label: 'Piagam Prestasi', route: 'Piagam', color: '#d97706' },
  { icon: 'newspaper-outline' as const, label: 'Berita & Artikel', route: 'Berita', color: '#059669' },
  { icon: 'library-outline' as const, label: 'Pustaka', route: 'Pustaka', color: '#dc2626' },
  { icon: 'people-outline' as const, label: 'Struktur Organisasi', route: 'StrukturOrganisasi', color: '#4f46e5' },
  { icon: 'wallet-outline' as const, label: 'Status Iuran', route: 'Iuran', color: '#ca8a04' },
  { icon: 'person-add-outline' as const, label: 'Klaim Keanggotaan', route: 'Claim', color: '#0891b2' },
];

export default function AnggotaDashboard({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.nama || user.username || 'Anggota');
    }
  };

  const handleLogout = async () => {
    await unregisterDeviceToken();
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
    navigation.replace('Login');
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="card" size={24} color="#0891b2" />
          <Text style={styles.statLabel}>Kartu</Text>
          <Text style={styles.statValue}>1</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="ribbon" size={24} color="#7c3aed" />
          <Text style={styles.statLabel}>Sertifikat</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet" size={24} color="#ca8a04" />
          <Text style={styles.statLabel}>Iuran</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#d97706" />
          <Text style={styles.statLabel}>Piagam</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
      </View>

      {/* Menu Grid */}
      <Text style={styles.sectionTitle}>Layanan</Text>
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e3a5f', paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#93c5fd', fontSize: 14 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  logoutBtn: { padding: 8 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, marginTop: 8, marginBottom: 12 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  menuItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  menuIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 11, fontWeight: '500', color: '#475569', textAlign: 'center', marginTop: 6 },
});
