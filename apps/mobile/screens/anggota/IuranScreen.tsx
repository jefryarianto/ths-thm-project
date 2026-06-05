import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { iuranApi } from '../../src/lib/api';

export default function IuranScreen() {
  const [loading, setLoading] = useState(true);
  const [iuranList, setIuranList] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
        if (parsed.anggota?.id) {
          const result = await iuranApi.list({ anggotaId: String(parsed.anggota.id) });
          setIuranList(result.data || []);
        }
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    // Simple status check - in production, check last payment date
    return { label: 'Aktif', color: '#059669', bg: '#f0fdf4' };
  };

  const status = getStatusBadge();
  const totalIuran = iuranList.reduce((sum, i) => sum + i.jumlah, 0);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <ScrollView style={styles.container}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="wallet" size={32} color="#1e3a5f" />
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.statusTitle}>Status Iuran</Text>
        <Text style={styles.statusSubtitle}>{currentMonth > 0 ? `Bulan ${currentMonth} - ${currentYear}` : '-'}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Dibayar</Text>
          <Text style={styles.statValue}>Rp {totalIuran.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Bulan Ini</Text>
          <Text style={styles.statValue}>Rp -</Text>
        </View>
      </View>

      {/* History */}
      <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : iuranList.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>Belum ada riwayat pembayaran</Text>
        </View>
      ) : (
        iuranList.map((iuran: any, index: number) => (
          <View key={index} style={styles.iuranItem}>
            <View style={styles.iuranLeft}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <View>
                <Text style={styles.iuranJenis}>{iuran.jenis}</Text>
                <Text style={styles.iuranDate}>{iuran.bulan}/{iuran.tahun}</Text>
              </View>
            </View>
            <Text style={styles.iuranAmount}>Rp {iuran.jumlah.toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  statusCard: { backgroundColor: '#fff', margin: 16, padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statusTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  statusSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statLabel: { fontSize: 12, color: '#64748b' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  iuranItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  iuranLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iuranJenis: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  iuranDate: { fontSize: 12, color: '#64748b' },
  iuranAmount: { fontSize: 14, fontWeight: '700', color: '#059669' },
});
