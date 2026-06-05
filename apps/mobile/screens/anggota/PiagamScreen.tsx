import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PiagamScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.empty}>
        <Ionicons name="trophy-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>Belum Ada Piagam</Text>
        <Text style={styles.emptySubtitle}>Piagam prestasi akan muncul di sini setelah diterbitkan oleh admin</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748b', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
