import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { dokumenApi } from '../../src/lib/api';

export default function KartuDigitalScreen() {
  const [loading, setLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) setUser(JSON.parse(data));
  };

  const handleDownload = async () => {
    if (!user?.anggota?.id) {
      Alert.alert('Info', 'Anda belum terdaftar sebagai anggota');
      return;
    }
    setLoading(true);
    try {
      const result = await dokumenApi.getKartuUrl(user.anggota.id);
      Alert.alert('Sukses', 'Kartu anggota berhasil di-generate');
      setCardInfo(result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Card Preview */}
      <View style={styles.cardContainer}>
        <View style={styles.cardFront}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>THS</Text>
            </View>
            <View style={styles.orgName}>
              <Text style={styles.orgText}>TUNGGAL HATI SEMINARI</Text>
              <Text style={styles.orgSubText}>TUNGGAL HATI MARIA</Text>
            </View>
          </View>
          <View style={styles.cardTitle}>
            <Text style={styles.cardTitleText}>KARTU TANDA ANGGOTA</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={48} color="#94a3b8" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{user?.anggota?.nama || user?.username || '-'}</Text>
              <Text style={styles.cardDetail}>No: {user?.anggota?.nomorAnggota || '-'}</Text>
              <Text style={styles.cardDetail}>Ranting: -</Text>
              <Text style={styles.cardDetail}>Wilayah: -</Text>
              <Text style={styles.cardDetail}>Distrik: -</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerLabel}>Berlaku sampai</Text>
            <Text style={styles.footerDate}>13 Juli 2030</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1e3a5f" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.downloadBtnText}>Generate & Download Kartu</Text>
          </TouchableOpacity>
        )}
      </View>

      {cardInfo && (
        <View style={styles.infoCard}>
          <Ionicons name="checkmark-circle" size={24} color="#059669" />
          <Text style={styles.infoText}>Kartu berhasil digenerate. Silakan cek menu download.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  cardContainer: { padding: 16, alignItems: 'center' },
  cardFront: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fde047', borderWidth: 2, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  cardLogoText: { fontSize: 14, fontWeight: '900', color: '#1e40af' },
  orgName: { flex: 1 },
  orgText: { fontSize: 12, fontWeight: '800', color: '#1e3a5f', letterSpacing: 0.5 },
  orgSubText: { fontSize: 10, color: '#64748b', letterSpacing: 0.3 },
  cardTitle: { alignItems: 'center', marginBottom: 20 },
  cardTitleText: { fontSize: 16, fontWeight: '900', color: '#1e3a5f', letterSpacing: 2, backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  photoPlaceholder: { width: 100, height: 130, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e2e8f0' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  cardDetail: { fontSize: 12, color: '#475569', marginTop: 2 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 12, color: '#64748b' },
  footerDate: { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1e3a5f', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  downloadBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f0fdf4', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#bbf7d0' },
  infoText: { color: '#166534', fontSize: 13, flex: 1 },
});
