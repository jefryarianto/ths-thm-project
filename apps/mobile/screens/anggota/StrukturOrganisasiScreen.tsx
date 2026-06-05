import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { organisasiApi } from '../../src/lib/api';

export default function StrukturOrganisasiScreen() {
  const [loading, setLoading] = useState(true);
  const [organisasi, setOrganisasi] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await organisasiApi.list();
      setOrganisasi(result.data || []);
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const tingkatColors: Record<string, { bg: string; text: string; icon: string }> = {
    Distrik: { bg: '#eff6ff', text: '#1e40af', icon: 'business' },
    Wilayah: { bg: '#f0fdf4', text: '#166534', icon: 'map' },
    Ranting: { bg: '#fef2f2', text: '#991b1b', icon: 'home' },
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const distrik = organisasi.filter((o: any) => o.tingkat === 'Distrik');
  const wilayah = organisasi.filter((o: any) => o.tingkat === 'Wilayah');
  const ranting = organisasi.filter((o: any) => o.tingkat === 'Ranting');

  const renderSection = (title: string, data: any[], tingkat: string) => {
    const colors = tingkatColors[tingkat] || tingkatColors.Ranting;
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((item: any, index: number) => (
          <View key={index} style={[styles.item, { borderLeftColor: colors.text }]}>
            <View style={[styles.itemIcon, { backgroundColor: colors.bg }]}>
              <Ionicons name={(colors.icon as any) || 'home'} size={20} color={colors.text} />
            </View>
            <View>
              <Text style={styles.itemName}>{item.nama}</Text>
              <Text style={styles.itemAlamat}>{item.alamat || '-'}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {organisasi.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Belum Ada Data</Text>
          <Text style={styles.emptySubtitle}>Struktur organisasi akan muncul setelah dikonfigurasi oleh admin</Text>
        </View>
      ) : (
        <>
          {renderSection('Distrik', distrik, 'Distrik')}
          {renderSection('Wilayah', wilayah, 'Wilayah')}
          {renderSection('Ranting', ranting, 'Ranting')}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748b', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', paddingHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  itemAlamat: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
