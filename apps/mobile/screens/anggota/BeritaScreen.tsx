import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { kontenApi } from '../../src/lib/api';

export default function BeritaScreen() {
  const [loading, setLoading] = useState(true);
  const [kontenList, setKontenList] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await kontenApi.list({ status: 'Dipublikasikan', limit: '20' });
      setKontenList(result.data || []);
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const typeIcons: Record<string, string> = {
    Berita: 'newspaper',
    Artikel: 'document-text',
    Video: 'videocam',
    Acara: 'calendar',
  };

  const typeColors: Record<string, string> = {
    Berita: '#059669',
    Artikel: '#4f46e5',
    Video: '#dc2626',
    Acara: '#d97706',
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {kontenList.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="newspaper-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Belum Ada Konten</Text>
          <Text style={styles.emptySubtitle}>Berita, artikel, dan informasi akan muncul di sini</Text>
        </View>
      ) : (
        kontenList.map((item: any, index: number) => {
          const type = item.jenis || 'Berita';
          const iconName = typeIcons[type] || 'document-text';
          const color = typeColors[type] || '#64748b';

          return (
            <TouchableOpacity key={index} style={styles.kontenItem}>
              <View style={[styles.kontenIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={iconName as any} size={28} color={color} />
              </View>
              <View style={styles.kontenInfo}>
                <View style={styles.kontenHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.typeText, { color }]}>{type}</Text>
                  </View>
                  <Text style={styles.kontenDate}>
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID') : ''}
                  </Text>
                </View>
                <Text style={styles.kontenTitle}>{item.judul}</Text>
                <Text style={styles.kontenExcerpt} numberOfLines={2}>
                  {item.konten?.replace(/<[^>]*>/g, '').substring(0, 100)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748b', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  kontenItem: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kontenIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  kontenInfo: { flex: 1 },
  kontenHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeText: { fontSize: 10, fontWeight: '700' },
  kontenDate: { fontSize: 11, color: '#94a3b8' },
  kontenTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  kontenExcerpt: { fontSize: 13, color: '#64748b', lineHeight: 18 },
});
