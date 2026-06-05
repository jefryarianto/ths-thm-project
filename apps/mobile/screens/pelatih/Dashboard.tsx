import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { unregisterDeviceToken } from '../../src/lib/notificationService';

const menuItems = [
  { icon: 'clipboard-outline' as const, label: 'Laporan Latihan', route: 'LaporanLatihan', color: '#0891b2' },
  { icon: 'people-outline' as const, label: 'Data Anggota', route: '', color: '#7c3aed' },
  { icon: 'calendar-outline' as const, label: 'Jadwal', route: '', color: '#d97706' },
];

export default function PelatihDashboard({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userData').then(d => {
      if (d) {
        const user = JSON.parse(d);
        setUserName(user.nama || user.username || 'Pelatih');
      }
    });
  }, []);

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
          <Text style={styles.roleBadge}>Pelatih</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Latihan Bulan Ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Total Anggota</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Minggu Ini</Text>
        </View>
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Menu</Text>
      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && navigation.navigate(item.route)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e3a5f', paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: '#93c5fd', fontSize: 14 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  roleBadge: { color: '#fde047', fontSize: 12, fontWeight: '600', marginTop: 4 },
  logoutBtn: { padding: 8 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1e3a5f' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, marginTop: 8, marginBottom: 12 },
  menuList: { paddingHorizontal: 16, gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
});
