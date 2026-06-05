import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { claimApi } from '../../src/lib/api';

export default function ClaimScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await claimApi.searchAnggota(searchQuery);
      setSearchResults(result || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedAnggota) return;
    setSubmitting(true);
    try {
      await claimApi.submit(selectedAnggota.id);
      Alert.alert('Sukses', 'Klaim keanggotaan telah diajukan. Silakan tunggu verifikasi admin.');
      setSelectedAnggota(null);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#1e3a5f" />
        <Text style={styles.infoText}>
          Cari data anggota Anda untuk mengklaim keanggotaan. Masukkan nomor anggota, nomor HP, atau email.
        </Text>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.label}>Cari Data Anggota</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Nomor anggota / No. HP / Email"
            placeholderTextColor="#94a3b8"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={searching}>
            {searching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsList}>
            {searchResults.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.resultItem, selectedAnggota?.id === item.id && styles.selectedItem]}
                onPress={() => setSelectedAnggota(item)}
              >
                <View style={styles.resultIcon}>
                  <Ionicons name="person" size={20} color="#1e3a5f" />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.nama}</Text>
                  <Text style={styles.resultDetail}>{item.nomorAnggota} - {item.nomorHp}</Text>
                </View>
                {selectedAnggota?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.length === 0 && !searching && searchQuery ? (
          <Text style={styles.noResult}>Data anggota tidak ditemukan</Text>
        ) : null}
      </View>

      {selectedAnggota && (
        <View style={styles.confirmSection}>
          <Text style={styles.confirmTitle}>Konfirmasi Klaim</Text>
          <View style={styles.confirmCard}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Nama</Text>
              <Text style={styles.confirmValue}>{selectedAnggota.nama}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>No. Anggota</Text>
              <Text style={styles.confirmValue}>{selectedAnggota.nomorAnggota}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>No. HP</Text>
              <Text style={styles.confirmValue}>{selectedAnggota.nomorHp}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmitClaim}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Ajukan Klaim</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  infoCard: { flexDirection: 'row', gap: 12, backgroundColor: '#eff6ff', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  infoText: { flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 20 },
  searchSection: { paddingHorizontal: 16, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b' },
  searchBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center' },
  resultsList: { marginTop: 12, gap: 8 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  selectedItem: { borderColor: '#1e3a5f', backgroundColor: '#eff6ff' },
  resultIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  resultDetail: { fontSize: 12, color: '#64748b' },
  noResult: { textAlign: 'center', color: '#94a3b8', marginTop: 16 },
  confirmSection: { paddingHorizontal: 16, marginBottom: 24 },
  confirmTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  confirmLabel: { fontSize: 13, color: '#64748b' },
  confirmValue: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', padding: 16, borderRadius: 12, marginTop: 16 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
