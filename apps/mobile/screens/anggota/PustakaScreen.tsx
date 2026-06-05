import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pustakaApi } from '../../src/lib/api';

export default function PustakaScreen() {
  const [loading, setLoading] = useState(true);
  const [materiList, setMateriList] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await pustakaApi.list({ limit: '20' });
      setMateriList(result.data || []);
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {materiList.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="library-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Belum Ada Materi</Text>
          <Text style={styles.emptySubtitle}>Materi pustaka akan muncul di sini setelah ditambahkan oleh admin</Text>
        </View>
      ) : (
        materiList.map((item: any, index: number) => (
          <TouchableOpacity key={index} style={styles.materiItem}>
            <View style={styles.materiIcon}>
              <Ionicons name="document-text" size={24} color="#dc2626" />
            </View>
            <View style={styles.materiInfo}>
              <Text style={styles.materiTitle}>{item.judul}</Text>
              <Text style={styles.materiDesc} numberOfLines={2}>{item.deskripsi}</Text>
              <Text style={styles.materiMeta}>{item.kategori || 'Umum'} • {item.fileSize || '-'}</Text>
            </View>
            <Ionicons name="download-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748b', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  materiItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  materiIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  materiInfo: { flex: 1 },
  materiTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  materiDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  materiMeta: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
});
