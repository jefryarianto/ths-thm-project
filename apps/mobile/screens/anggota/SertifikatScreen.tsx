import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SertifikatScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('userData').then(d => d && setUser(JSON.parse(d)));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.empty}>
        <Ionicons name="ribbon-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>Belum Ada Sertifikat</Text>
        <Text style={styles.emptySubtitle}>Sertifikat pendadaran akan muncul di sini setelah lulus pendadaran</Text>
      </View>

      {user?.anggota?.id && (
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Download Sertifikat</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748b', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1e3a5f', marginHorizontal: 32, padding: 16, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
