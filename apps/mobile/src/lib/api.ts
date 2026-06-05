import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    }
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (identifier: string, password: string) =>
    fetchApi<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  sendOtp: (identifier: string) =>
    fetchApi<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),
  resetPassword: (identifier: string, otpCode: string, newPassword: string) =>
    fetchApi<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, otpCode, newPassword }),
    }),
  refresh: (refreshToken: string) =>
    fetchApi<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  registerFcmToken: (fcmToken: string) =>
    fetchApi<{ message: string }>('/auth/register-fcm-token', {
      method: 'POST',
      body: JSON.stringify({ fcmToken }),
    }),
  unregisterFcmToken: (fcmToken: string) =>
    fetchApi<{ message: string }>('/auth/unregister-fcm-token', {
      method: 'POST',
      body: JSON.stringify({ fcmToken }),
    }),
};


// Anggota
export const anggotaApi = {
  getProfile: () => fetchApi<any>('/anggota/me'),
  getById: (id: number) => fetchApi<any>(`/anggota/${id}`),
};

// Dokumen
export const dokumenApi = {
  getKartuUrl: (anggotaId: number) => fetchApi<{ url: string }>(`/dokumen/kartu-anggota/${anggotaId}/download`),
  getSertifikatUrl: (anggotaId: number) => fetchApi<{ url: string }>(`/dokumen/sertifikat/${anggotaId}/download`),
  verify: (token: string) => fetchApi<any>(`/dokumen/verify/${token}`),
};

// Iuran
export const iuranApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any>(`/iuran${qs}`);
  },
};

// Klaim
export const claimApi = {
  searchAnggota: (q: string) => fetchApi<any[]>(`/anggota/search-claim?q=${q}`),
  submit: (anggotaId: number) =>
    fetchApi<any>('/claim', { method: 'POST', body: JSON.stringify({ anggotaId }) }),
};

// Konten
export const kontenApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any>(`/konten${qs}`);
  },
};

// Pustaka
export const pustakaApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any>(`/pustaka${qs}`);
  },
};

// Organisasi
export const organisasiApi = {
  list: (tingkat?: string) => fetchApi<any>(`/organisasi${tingkat ? `?tingkat=${tingkat}` : ''}`),
};

// Latihan (for pelatih)
export const latihanApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any>(`/latihan${qs}`);
  },
  create: (data: any) =>
    fetchApi<any>('/latihan', { method: 'POST', body: JSON.stringify(data) }),
};
