import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { latihanApi } from '../../src/lib/api';

export default function LaporanLatihanScreen() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [hari, setHari] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [jumlahAnggota, setJumlahAnggota] = useState('');
  const [jumlahCalon, setJumlahCalon] = useState('');
  const [jenisMateri, setJenisMateri] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const handleSubmit = async () => {
    if (!tanggal || !hari || !lokasi || !jumlahAnggota || !jumlahCalon || !jenisMateri) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      await latihanApi.create({
        tanggal,
        hari,
        lokasi,
        jumlahAnggotaHadir: parseInt(jumlahAnggota),
        jumlahCalonHadir: parseInt(jumlahCalon),
        jenisMateri,
        rantingId: 1, // Default - should come from user profile
      });

      Alert.alert('Sukses', 'Laporan latihan berhasil disimpan');

      // Reset form
      setHari('');
      setLokasi('');
      setJumlahAnggota('');
      setJumlahCalon('');
      setJenisMateri('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>Input Laporan Latihan</Text>

        <Text style={styles.label}>Tanggal</Text>
        <TextInput style={styles.input} value={tanggal} onChangeText={setTanggal} placeholder="YYYY-MM-DD" />

        <Text style={styles.label}>Hari</Text>
        <View style={styles.dayRow}>
          {dayNames.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayBtn, hari === d && styles.dayBtnActive]}
              onPress={() => setHari(d)}
            >
              <Text style={[styles.dayBtnText, hari === d && styles.dayBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Lokasi</Text>
        <TextInput style={styles.input} value={lokasi} onChangeText={setLokasi} placeholder="Tempat latihan" />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Anggota Hadir</Text>
            <TextInput style={styles.input} value={jumlahAnggota} onChangeText={setJumlahAnggota} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Calon Hadir</Text>
            <TextInput style={styles.input} value={jumlahCalon} onChangeText={setJumlahCalon} keyboardType="numeric" placeholder="0" />
          </View>
        </View>

        <Text style={styles.label}>Jenis Materi Latihan</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={jenisMateri}
          onChangeText={setJenisMateri}
          placeholder="Deskripsi materi latihan"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Simpan Laporan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  form: { padding: 16 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  dayBtnActive: { backgroundColor: '#1e3a5f', borderColor: '#1e3a5f' },
  dayBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  dayBtnTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1e3a5f', padding: 16, borderRadius: 12, marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
