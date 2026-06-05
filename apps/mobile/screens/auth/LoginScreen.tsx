import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  Image, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../src/lib/api';
import { registerDeviceToken } from '../../src/lib/notificationService';

interface LoginScreenProps {
  navigation: any;
}

// ── Forgot Password Modal ──────────────────────────────────────────────────────
type ForgotStep = 'identifier' | 'otp' | 'newPassword';

function ForgotPasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [step, setStep] = useState<ForgotStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep('identifier');
    setIdentifier('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Masukkan email atau nomor HP');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(identifier.trim());
      setStep('otp');
      Alert.alert('OTP Terkirim', 'Kode OTP telah dikirim ke perangkat Anda');
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Pengguna tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Masukkan 6 digit kode OTP');
      return;
    }
    setStep('newPassword');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(identifier.trim(), otpCode, newPassword);
      Alert.alert('Berhasil', 'Password berhasil direset. Silakan login dengan password baru.', [
        { text: 'OK', onPress: handleClose },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'OTP tidak valid atau sudah kadaluarsa');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={modal.overlay}>
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Lupa Password</Text>
            <TouchableOpacity onPress={handleClose} style={modal.closeBtn}>
              <Text style={modal.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Step indicator */}
          <View style={modal.steps}>
            {(['identifier', 'otp', 'newPassword'] as ForgotStep[]).map((s, i) => (
              <View key={s} style={modal.stepRow}>
                <View style={[modal.stepDot, step === s && modal.stepDotActive,
                  (['identifier', 'otp', 'newPassword'].indexOf(step) > i) && modal.stepDotDone]}>
                  <Text style={modal.stepNum}>{i + 1}</Text>
                </View>
                {i < 2 && <View style={modal.stepLine} />}
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 'identifier' && (
              <View>
                <Text style={modal.label}>Email / Nomor HP</Text>
                <TextInput
                  style={modal.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="Masukkan email atau nomor HP"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={[modal.btn, loading && modal.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> :
                    <Text style={modal.btnText}>Kirim OTP</Text>}
                </TouchableOpacity>
              </View>
            )}

            {step === 'otp' && (
              <View>
                <Text style={modal.desc}>Masukkan 6 digit kode OTP yang dikirim ke perangkat Anda</Text>
                <Text style={modal.label}>Kode OTP</Text>
                <TextInput
                  style={[modal.input, modal.otpInput]}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="000000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity style={modal.btn} onPress={handleVerifyOtp}>
                  <Text style={modal.btnText}>Verifikasi OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modal.linkBtn} onPress={() => setStep('identifier')}>
                  <Text style={modal.linkText}>Kirim ulang OTP</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'newPassword' && (
              <View>
                <Text style={modal.label}>Password Baru</Text>
                <View style={modal.inputRow}>
                  <TextInput
                    style={[modal.input, modal.inputFlex]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNew}
                  />
                  <TouchableOpacity style={modal.eyeBtn} onPress={() => setShowNew(!showNew)}>
                    <Text style={modal.eyeIcon}>{showNew ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={modal.label}>Konfirmasi Password</Text>
                <View style={modal.inputRow}>
                  <TextInput
                    style={[modal.input, modal.inputFlex]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Ulangi password baru"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity style={modal.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                    <Text style={modal.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[modal.btn, loading && modal.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> :
                    <Text style={modal.btnText}>Reset Password</Text>}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Login Screen ───────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.login(identifier, password);
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      registerDeviceToken();
      if (response.user.role === 'pelatih') {
        navigation.replace('PelatihMain');
      } else {
        navigation.replace('AnggotaMain');
      }
    } catch (error: any) {
      Alert.alert('Login Gagal', error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ForgotPasswordModal visible={forgotVisible} onClose={() => setForgotVisible(false)} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.subtitle}>Sistem Manajemen Anggota</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nomor Anggota / Username / Email / No. HP</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Masukkan identitas"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity onPress={() => setForgotVisible(true)}>
            <Text style={styles.forgotText}>Lupa Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={password}
            onChangeText={setPassword}
            placeholder="Masukkan password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Masuk</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.otpButton} onPress={() => Alert.alert('Info', 'Fitur OTP akan segera tersedia')}>
          <Text style={styles.otpButtonText}>Masuk dengan OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.claimButton} onPress={() => navigation.navigate('Claim')}>
          <Text style={styles.claimButtonText}>Klaim Keanggotaan</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', paddingVertical: 40 },
  logoContainer: { width: 160, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoImage: { width: 160, height: 120 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  form: { paddingHorizontal: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 16 },
  forgotText: { fontSize: 13, color: '#1e3a5f', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1e293b' },
  inputFlex: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 14 },
  eyeIcon: { fontSize: 18 },
  button: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  otpButton: { marginTop: 16, alignItems: 'center', padding: 12 },
  otpButtonText: { color: '#1e3a5f', fontSize: 14, fontWeight: '600' },
  claimButton: { marginTop: 8, alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#1e3a5f', borderRadius: 12 },
  claimButtonText: { color: '#1e3a5f', fontSize: 14, fontWeight: '600' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 18, color: '#64748b' },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#1e3a5f' },
  stepDotDone: { backgroundColor: '#22c55e' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepLine: { width: 32, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  desc: { fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1e293b' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 14 },
  eyeIcon: { fontSize: 18 },
  otpInput: { textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: '700' },
  btn: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 12, padding: 8 },
  linkText: { color: '#1e3a5f', fontSize: 14, fontWeight: '600' },
});
