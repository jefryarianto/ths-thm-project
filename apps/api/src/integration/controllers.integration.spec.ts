import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { RolesGuard } from '../auth/roles.guard.js';

// ─── Mock AuthGuard ───
let mockUserRole = 'superadmin';
let mockUserId = 1;

jest.mock('@nestjs/passport', () => {
  const MockAuthGuard = jest.fn().mockImplementation(() => ({
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: mockUserId, uuid: 'admin-uuid', role: mockUserRole, permissions: [] };
      return true;
    },
  }));
  return { AuthGuard: () => MockAuthGuard };
});

// ─── Mocked Services ───

function createKegiatanMock() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, nama: 'Test Kegiatan' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findById: jest.fn().mockResolvedValue({ id: 1, nama: 'Test Kegiatan' }),
    update: jest.fn().mockResolvedValue({ id: 1, nama: 'Updated' }),
    publish: jest.fn().mockResolvedValue({ id: 1, status: 'published' }),
    close: jest.fn().mockResolvedValue({ id: 1, status: 'closed' }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };
}

function createOrganisasiMock() {
  return {
    createNasional: jest.fn().mockResolvedValue({ id: 1, nama: 'Nasional Test', tingkat: 'nasional' }),
    findAllNasional: jest.fn().mockResolvedValue([]),
    findNasionalById: jest.fn().mockResolvedValue({ id: 1, nama: 'Nasional Test' }),
    updateNasional: jest.fn().mockResolvedValue({ id: 1, nama: 'Updated' }),
    deleteNasional: jest.fn().mockResolvedValue({ id: 1 }),
    createDistrik: jest.fn().mockResolvedValue({ id: 1, nama: 'Distrik Test' }),
    findAllDistrik: jest.fn().mockResolvedValue([]),
    findDistrikById: jest.fn().mockResolvedValue({ id: 1, nama: 'Distrik Test' }),
    updateDistrik: jest.fn().mockResolvedValue({ id: 1, nama: 'Updated' }),
    deleteDistrik: jest.fn().mockResolvedValue({ id: 1 }),
    createWilayah: jest.fn().mockResolvedValue({ id: 1, nama: 'Wilayah Test' }),
    findAllWilayah: jest.fn().mockResolvedValue([]),
    findWilayahById: jest.fn().mockResolvedValue({ id: 1, nama: 'Wilayah Test' }),
    updateWilayah: jest.fn().mockResolvedValue({ id: 1, nama: 'Updated' }),
    deleteWilayah: jest.fn().mockResolvedValue({ id: 1 }),
    createRanting: jest.fn().mockResolvedValue({ id: 1, nama: 'Ranting Test' }),
    findAllRanting: jest.fn().mockResolvedValue([]),
    findRantingById: jest.fn().mockResolvedValue({ id: 1, nama: 'Ranting Test' }),
    updateRanting: jest.fn().mockResolvedValue({ id: 1, nama: 'Updated' }),
    deleteRanting: jest.fn().mockResolvedValue({ id: 1 }),
    createUnitLatihan: jest.fn().mockResolvedValue({ id: 1, nama: 'Unit Latihan Test' }),
    findAllUnitLatihan: jest.fn().mockResolvedValue([]),
    getHierarchyTree: jest.fn().mockResolvedValue({}),
  };
}

function createPendadaranMock() {
  return {
    getAspek: jest.fn().mockResolvedValue([]),
    createAspek: jest.fn().mockResolvedValue({ id: 1, kodeAspek: 'A1' }),
    createItem: jest.fn().mockResolvedValue({ id: 1, namaItem: 'Item 1' }),
    assignPenguji: jest.fn().mockResolvedValue({ id: 1 }),
    getPengujiByKegiatan: jest.fn().mockResolvedValue([]),
    inputNilai: jest.fn().mockResolvedValue({ id: 1 }),
    inputNilaiBulk: jest.fn().mockResolvedValue({ count: 3 }),
    hitungHasil: jest.fn().mockResolvedValue({ nilaiAkhir: 85 }),
    validasiHasil: jest.fn().mockResolvedValue({ status: 'Lulus' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findByCalon: jest.fn().mockResolvedValue([]),
    getNilaiDetail: jest.fn().mockResolvedValue({}),
  };
}

function createSuratMock() {
  return {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    createMasuk: jest.fn().mockResolvedValue({ id: 1, pengirim: 'Test' }),
    createKeluar: jest.fn().mockResolvedValue({ id: 1, penerima: 'Test' }),
    findAllMasuk: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findAllKeluar: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    updateMasuk: jest.fn().mockResolvedValue({ id: 1 }),
    deleteMasuk: jest.fn().mockResolvedValue({ id: 1 }),
    updateKeluar: jest.fn().mockResolvedValue({ id: 1 }),
    deleteKeluar: jest.fn().mockResolvedValue({ id: 1 }),
  };
}

function createAuthMock() {
  return {
    login: jest.fn().mockResolvedValue({ accessToken: 'test-token', refreshToken: 'test-refresh' }),
    sendOtp: jest.fn().mockResolvedValue({ message: 'OTP sent' }),
    refreshToken: jest.fn().mockResolvedValue({ accessToken: 'new-token', refreshToken: 'new-refresh' }),
    logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
    registerFcmToken: jest.fn().mockResolvedValue({ message: 'FCM registered' }),
    unregisterFcmToken: jest.fn().mockResolvedValue({ message: 'FCM unregistered' }),
    register: jest.fn().mockResolvedValue({ id: 1, username: 'newuser' }),
  };
}

function createDokumenMock() {
  return {
    generateKartuAnggota: jest.fn().mockResolvedValue({ id: 1, qrToken: 'abc' }),
    generateSertifikat: jest.fn().mockResolvedValue({ id: 1, nomorSertifikat: 'S-001' }),
    generatePiagam: jest.fn().mockResolvedValue({ id: 1, prestasi: 'Juara 1' }),
    verifyDocument: jest.fn().mockResolvedValue({ valid: true }),
    getDocumentUrl: jest.fn().mockResolvedValue('https://example.com/doc.pdf'),
    revokeDocument: jest.fn().mockResolvedValue({ id: 1, status: 'revoked' }),
  };
}

function createClaimMock() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, status: 'Pending' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    approve: jest.fn().mockResolvedValue({ message: 'Disetujui' }),
    reject: jest.fn().mockResolvedValue({ message: 'Ditolak' }),
  };
}

function createAuditMock() {
  return {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
  };
}

function createKontenMock() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, judul: 'Test', status: 'Draft' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findPublished: jest.fn().mockResolvedValue([]),
    submitReview: jest.fn().mockResolvedValue({ id: 1, status: 'Dipublikasikan' }),
  };
}

function createLatihanMock() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, hari: 'Senin' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findById: jest.fn().mockResolvedValue({ id: 1, hari: 'Senin' }),
  };
}

function createPustakaMock() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, judul: 'Test Book' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
  };
}

function createUsersMock() {
  return {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findById: jest.fn().mockResolvedValue({ id: 1, username: 'admin' }),
    create: jest.fn().mockResolvedValue({ id: 1, username: 'newuser' }),
    update: jest.fn().mockResolvedValue({ id: 1, username: 'updated' }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };
}

function createRolesMock() {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1, nama: 'admin' }),
    create: jest.fn().mockResolvedValue({ id: 1, nama: 'newrole' }),
    update: jest.fn().mockResolvedValue({ id: 1, nama: 'updated' }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };
}

function createIuranMock() {
  return {
    createPembayaran: jest.fn().mockResolvedValue({ id: 1, jumlahBayar: 50000 }),
    findAllPembayaran: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    createJenis: jest.fn().mockResolvedValue({ id: 1, nama: 'Iuran Bulanan' }),
    findAllJenis: jest.fn().mockResolvedValue([]),
    getStatusAnggota: jest.fn().mockResolvedValue({ totalIuran: 50000 }),
    getDashboardStats: jest.fn().mockResolvedValue({ totalIuran: 100000, totalAnggota: 10, iuranBulanIni: 50000 }),
    getMonthlyChart: jest.fn().mockResolvedValue([]),
    verifyPembayaran: jest.fn().mockResolvedValue({ id: 1, status: 'verified' }),
  };
}

function createAbsensiMock() {
  return {
    recordKegiatan: jest.fn().mockResolvedValue({ id: 1, hadir: true }),
    recordLatihan: jest.fn().mockResolvedValue({ id: 1, hadir: true }),
    recordLatihanBulk: jest.fn().mockResolvedValue({ count: 1 }),
    findKegiatanByKegiatan: jest.fn().mockResolvedValue([]),
    findLatihanByLatihan: jest.fn().mockResolvedValue([]),
  };
}

function createOrganisasiDokumenMock() {
  return {
    create: jest.fn().mockResolvedValue({ id: 1, judul: 'Dokumen Test' }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
    findById: jest.fn().mockResolvedValue({ id: 1, judul: 'Dokumen Test' }),
    findByKategori: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ id: 1, judul: 'Updated' }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };
}

function createPrismaMock() {
  return {
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
// TEST SUITE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───

describe('Controllers (integration) — decorator branches', () => {
  // Each controller gets its own app instance for isolation
  // We use separate apps to avoid cross-controller interference

  afterEach(() => {
    jest.clearAllMocks();
    mockUserRole = 'superadmin';
    mockUserId = 1;
  });

  // ── 1. SURAT ────────────────────────────────────────────────────

  describe('SuratController', () => {
    let app: INestApplication;
    let suratService: ReturnType<typeof createSuratMock>;

    beforeAll(async () => {
      suratService = createSuratMock();
      const { SuratController } = await import('../surat/surat.controller.js');
      const module = await Test.createTestingModule({
        controllers: [SuratController],
        providers: [
          { provide: await import('../surat/surat.service.js').then(m => m.SuratService), useValue: suratService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /surat — authorized (superadmin)', async () => {
      const res = await request(app.getHttpServer()).get('/surat').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('POST /surat/masuk — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/surat/masuk').set('Authorization', 'Bearer t').send({ nomorSurat: 'S-001', pengirim: 'Test', perihal: 'Test', tanggalSurat: '2026-06-01', tanggalTerima: '2026-06-01' });
      expect(res.status).toBe(201);
    });

    it('POST /surat/keluar — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/surat/keluar').set('Authorization', 'Bearer t').send({ nomorSurat: 'S-002', penerima: 'Test', perihal: 'Test', tanggalSurat: '2026-06-01' });
      expect(res.status).toBe(201);
    });

    it('GET /surat/masuk — authorized', async () => {
      const res = await request(app.getHttpServer()).get('/surat/masuk').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('GET /surat/keluar — authorized', async () => {
      const res = await request(app.getHttpServer()).get('/surat/keluar').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('PUT /surat/masuk/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).put('/surat/masuk/1').set('Authorization', 'Bearer t').send({ perihal: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('DELETE /surat/masuk/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).delete('/surat/masuk/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('PUT /surat/keluar/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).put('/surat/keluar/1').set('Authorization', 'Bearer t').send({ penerima: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('DELETE /surat/keluar/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).delete('/surat/keluar/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('GET /surat — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).get('/surat').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 2. KEGIATAN ─────────────────────────────────────────────────

  describe('KegiatanController', () => {
    let app: INestApplication;
    let kegiatanService: ReturnType<typeof createKegiatanMock>;

    beforeAll(async () => {
      kegiatanService = createKegiatanMock();
      const { KegiatanController } = await import('../kegiatan/kegiatan.controller.js');
      const module = await Test.createTestingModule({
        controllers: [KegiatanController],
        providers: [
          { provide: await import('../kegiatan/kegiatan.service.js').then(m => m.KegiatanService), useValue: kegiatanService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /kegiatan — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/kegiatan').set('Authorization', 'Bearer t').send({ nama: 'Test', tipe: 'Pelatihan', tanggalMulai: '2026-06-01', lokasi: 'Aula', scopeType: 'ranting', scopeId: 1 });
      expect(res.status).toBe(201);
    });

    it('GET /kegiatan — authorized (no auth needed)', async () => {
      const res = await request(app.getHttpServer()).get('/kegiatan');
      expect(res.status).toBe(200);
    });

    it('GET /kegiatan/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).get('/kegiatan/1');
      expect(res.status).toBe(200);
    });

    it('PUT /kegiatan/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).put('/kegiatan/1').set('Authorization', 'Bearer t').send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('POST /kegiatan/1/publish — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/kegiatan/1/publish').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });

    it('POST /kegiatan/1/close — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/kegiatan/1/close').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });

    it('DELETE /kegiatan/1 — superadmin only', async () => {
      const res = await request(app.getHttpServer()).delete('/kegiatan/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('DELETE /kegiatan/1 — unauthorized role (403)', async () => {
      mockUserRole = 'pelatih';
      const res = await request(app.getHttpServer()).delete('/kegiatan/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 3. ORGANISASI ───────────────────────────────────────────────

  describe('OrganisasiController', () => {
    let app: INestApplication;
    let organisasiService: ReturnType<typeof createOrganisasiMock>;

    beforeAll(async () => {
      organisasiService = createOrganisasiMock();
      const { OrganisasiController } = await import('../organisasi/organisasi.controller.js');
      const module = await Test.createTestingModule({
        controllers: [OrganisasiController],
        providers: [
          { provide: await import('../organisasi/organisasi.service.js').then(m => m.OrganisasiService), useValue: organisasiService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    // Nasional
    it('POST /organisasi/nasional', async () => {
      const res = await request(app.getHttpServer()).post('/organisasi/nasional').set('Authorization', 'Bearer t').send({ nama: 'Nasional', kode: 'N01' });
      expect(res.status).toBe(201);
    });
    it('GET /organisasi/nasional', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/nasional');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi/nasional/1', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/nasional/1');
      expect(res.status).toBe(200);
    });
    it('PUT /organisasi/nasional/1', async () => {
      const res = await request(app.getHttpServer()).put('/organisasi/nasional/1').set('Authorization', 'Bearer t').send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });
    it('DELETE /organisasi/nasional/1', async () => {
      const res = await request(app.getHttpServer()).delete('/organisasi/nasional/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    // Distrik
    it('POST /organisasi/distrik', async () => {
      const res = await request(app.getHttpServer()).post('/organisasi/distrik').set('Authorization', 'Bearer t').send({ nasionalId: 1, kodeDistrik: 'D01', nama: 'Distrik Test' });
      expect(res.status).toBe(201);
    });
    it('GET /organisasi/distrik', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/distrik');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi/distrik/1', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/distrik/1');
      expect(res.status).toBe(200);
    });
    it('PUT /organisasi/distrik/1', async () => {
      const res = await request(app.getHttpServer()).put('/organisasi/distrik/1').set('Authorization', 'Bearer t').send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });
    it('DELETE /organisasi/distrik/1', async () => {
      const res = await request(app.getHttpServer()).delete('/organisasi/distrik/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    // Wilayah
    it('POST /organisasi/wilayah', async () => {
      const res = await request(app.getHttpServer()).post('/organisasi/wilayah').set('Authorization', 'Bearer t').send({ distrikId: 1, kodeWilayah: 'W01', nama: 'Wilayah Test' });
      expect(res.status).toBe(201);
    });
    it('GET /organisasi/wilayah', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/wilayah');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi/wilayah/1', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/wilayah/1');
      expect(res.status).toBe(200);
    });
    it('PUT /organisasi/wilayah/1', async () => {
      const res = await request(app.getHttpServer()).put('/organisasi/wilayah/1').set('Authorization', 'Bearer t').send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });
    it('DELETE /organisasi/wilayah/1', async () => {
      const res = await request(app.getHttpServer()).delete('/organisasi/wilayah/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    // Ranting
    it('POST /organisasi/ranting', async () => {
      const res = await request(app.getHttpServer()).post('/organisasi/ranting').set('Authorization', 'Bearer t').send({ wilayahId: 1, kodeRanting: 'R01', nama: 'Ranting Test' });
      expect(res.status).toBe(201);
    });
    it('GET /organisasi/ranting', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/ranting');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi/ranting/1', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/ranting/1');
      expect(res.status).toBe(200);
    });
    it('PUT /organisasi/ranting/1', async () => {
      const res = await request(app.getHttpServer()).put('/organisasi/ranting/1').set('Authorization', 'Bearer t').send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });
    it('DELETE /organisasi/ranting/1', async () => {
      const res = await request(app.getHttpServer()).delete('/organisasi/ranting/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    // Unit Latihan
    it('POST /organisasi/unit-latihan', async () => {
      const res = await request(app.getHttpServer()).post('/organisasi/unit-latihan').set('Authorization', 'Bearer t').send({ distrikId: 1, nama: 'Unit Latihan Test' });
      expect(res.status).toBe(201);
    });
    it('GET /organisasi/unit-latihan', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/unit-latihan');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi/hierarchy', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi/hierarchy');
      expect(res.status).toBe(200);
    });

    // Unauthorized
    it('DELETE /organisasi/nasional/1 — unauthorized (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).delete('/organisasi/nasional/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 4. PENDADARAN ───────────────────────────────────────────────

  describe('PendadaranController', () => {
    let app: INestApplication;
    let pendadaranService: ReturnType<typeof createPendadaranMock>;

    beforeAll(async () => {
      pendadaranService = createPendadaranMock();
      const { PendadaranController } = await import('../pendadaran/pendadaran.controller.js');
      const module = await Test.createTestingModule({
        controllers: [PendadaranController],
        providers: [
          { provide: await import('../pendadaran/pendadaran.service.js').then(m => m.PendadaranService), useValue: pendadaranService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /pendadaran/aspek', async () => {
      const res = await request(app.getHttpServer()).get('/pendadaran/aspek');
      expect(res.status).toBe(200);
    });
    it('POST /pendadaran/aspek', async () => {
      const res = await request(app.getHttpServer()).post('/pendadaran/aspek').set('Authorization', 'Bearer t').send({ kodeAspek: 'A1', namaAspek: 'Test Aspek', bobot: 20 });
      expect(res.status).toBe(201);
    });
    it('POST /pendadaran/item', async () => {
      const res = await request(app.getHttpServer()).post('/pendadaran/item').set('Authorization', 'Bearer t').send({ aspekId: 1, kodeItem: 'I1', namaItem: 'Item 1', skorMaksimal: 100, bobot: 50, urutan: 1 });
      expect(res.status).toBe(201);
    });
    it('POST /pendadaran/penguji', async () => {
      const res = await request(app.getHttpServer()).post('/pendadaran/penguji').set('Authorization', 'Bearer t').send({ kegiatanId: 1, pengujiUserId: 2, peran: 'Penguji' });
      expect(res.status).toBe(201);
    });
    it('GET /pendadaran/penguji/1', async () => {
      const res = await request(app.getHttpServer()).get('/pendadaran/penguji/1');
      expect(res.status).toBe(200);
    });
    it('POST /pendadaran/nilai', async () => {
      const res = await request(app.getHttpServer()).post('/pendadaran/nilai').set('Authorization', 'Bearer t').send({ kegiatanId: 1, calonAnggotaId: 1, itemPenilaianId: 1, skor: 80 });
      expect(res.status).toBe(201);
    });
    it('POST /pendadaran/nilai/bulk', async () => {
      const res = await request(app.getHttpServer()).post('/pendadaran/nilai/bulk').set('Authorization', 'Bearer t').send({ kegiatanId: 1, calonAnggotaId: 1, entries: [{ itemPenilaianId: 1, skor: 80 }] });
      expect(res.status).toBe(201);
    });
    it('POST /pendadaran/hitung', async () => {
      const res = await request(app.getHttpServer()).post('/pendadaran/hitung').set('Authorization', 'Bearer t').send({ kegiatanId: 1, calonAnggotaId: 1 });
      expect(res.status).toBe(201);
    });
    it('PUT /pendadaran/validasi', async () => {
      const res = await request(app.getHttpServer()).put('/pendadaran/validasi').set('Authorization', 'Bearer t').send({ kegiatanId: 1, calonAnggotaId: 1, status: 'Lulus' });
      expect(res.status).toBe(200);
    });
    it('GET /pendadaran', async () => {
      const res = await request(app.getHttpServer()).get('/pendadaran');
      expect(res.status).toBe(200);
    });
    it('GET /pendadaran/calon/1', async () => {
      const res = await request(app.getHttpServer()).get('/pendadaran/calon/1');
      expect(res.status).toBe(200);
    });
    it('GET /pendadaran/detail/1/1', async () => {
      const res = await request(app.getHttpServer()).get('/pendadaran/detail/1/1');
      expect(res.status).toBe(200);
    });
  });

  // ── 5. AUTH ─────────────────────────────────────────────────────

  describe('AuthController', () => {
    let app: INestApplication;
    let authService: ReturnType<typeof createAuthMock>;
    let prisma: ReturnType<typeof createPrismaMock>;

    beforeAll(async () => {
      authService = createAuthMock();
      prisma = createPrismaMock();
      const { AuthController } = await import('../auth/auth.controller.js');
      const module = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          { provide: await import('../auth/auth.service.js').then(m => m.AuthService), useValue: authService },
          { provide: await import('../prisma/prisma.service.js').then(m => m.PrismaService), useValue: prisma },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /auth/login', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({ identifier: 'admin', password: 'admin123' });
      expect(res.status).toBe(201);
    });
    it('POST /auth/send-otp', async () => {
      const res = await request(app.getHttpServer()).post('/auth/send-otp').send({ identifier: 'admin' });
      expect(res.status).toBe(201);
    });
    it('POST /auth/refresh', async () => {
      const res = await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: 'test-refresh' });
      expect(res.status).toBe(201);
    });
    it('POST /auth/logout', async () => {
      const res = await request(app.getHttpServer()).post('/auth/logout').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });
    it('POST /auth/register-fcm-token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register-fcm-token').set('Authorization', 'Bearer t').send({ fcmToken: 'fcm-device-token' });
      expect(res.status).toBe(201);
    });
    it('POST /auth/register-fcm-token — missing token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register-fcm-token').set('Authorization', 'Bearer t').send({});
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('FCM token is required');
    });
    it('POST /auth/unregister-fcm-token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/unregister-fcm-token').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });
    it('POST /auth/register', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').send({ name: 'New User', email: 'new@test.com', password: 'pass123' });
      expect(res.status).toBe(201);
    });
  });

  // ── 6. DOKUMEN ──────────────────────────────────────────────────

  describe('DokumenController', () => {
    let app: INestApplication;
    let dokumenService: ReturnType<typeof createDokumenMock>;

    beforeAll(async () => {
      dokumenService = createDokumenMock();
      const { DokumenController } = await import('../dokumen/dokumen.controller.js');
      const module = await Test.createTestingModule({
        controllers: [DokumenController],
        providers: [
          { provide: await import('../dokumen/dokumen.service.js').then(m => m.DokumenService), useValue: dokumenService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /dokumen/kartu-anggota/1/generate', async () => {
      const res = await request(app.getHttpServer()).post('/dokumen/kartu-anggota/1/generate').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });
    it('POST /dokumen/sertifikat/1/1/generate', async () => {
      const res = await request(app.getHttpServer()).post('/dokumen/sertifikat/1/1/generate').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });
    it('POST /dokumen/piagam/1/generate', async () => {
      const res = await request(app.getHttpServer()).post('/dokumen/piagam/1/generate').set('Authorization', 'Bearer t').send({ prestasi: 'Juara 1' });
      expect(res.status).toBe(201);
    });
    it('GET /dokumen/verify/abc', async () => {
      const res = await request(app.getHttpServer()).get('/dokumen/verify/abc');
      expect(res.status).toBe(200);
    });
    it('GET /dokumen/download/1/KARTU_ANGGOTA', async () => {
      const res = await request(app.getHttpServer()).get('/dokumen/download/1/KARTU_ANGGOTA');
      expect(res.status).toBe(302);
    });
    it('POST /dokumen/1/revoke', async () => {
      const res = await request(app.getHttpServer()).post('/dokumen/1/revoke').set('Authorization', 'Bearer t');
      expect(res.status).toBe(201);
    });
    it('POST /dokumen/1/revoke — unauthorized role (403)', async () => {
      mockUserRole = 'pelatih';
      const res = await request(app.getHttpServer()).post('/dokumen/1/revoke').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 7. CLAIM ────────────────────────────────────────────────────
  // Note: POST /claim only uses AuthGuard('jwt') without RolesGuard
  // Any authenticated user can submit a claim

  describe('ClaimController', () => {
    let app: INestApplication;
    let claimService: ReturnType<typeof createClaimMock>;

    beforeAll(async () => {
      claimService = createClaimMock();
      const { ClaimController } = await import('../claim/claim.controller.js');
      const module = await Test.createTestingModule({
        controllers: [ClaimController],
        providers: [
          { provide: await import('../claim/claim.service.js').then(m => m.ClaimService), useValue: claimService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /claim — any authenticated user', async () => {
      const res = await request(app.getHttpServer()).post('/claim').set('Authorization', 'Bearer t').send({ namaLengkap: 'Test', nomorAnggotaInput: '001' });
      expect(res.status).toBe(201);
    });
    it('GET /claim — admin authorized', async () => {
      const res = await request(app.getHttpServer()).get('/claim').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('PUT /claim/1/approve — authorized', async () => {
      const res = await request(app.getHttpServer()).put('/claim/1/approve').set('Authorization', 'Bearer t').send({ catatanAdmin: 'Disetujui' });
      expect(res.status).toBe(200);
    });
    it('PUT /claim/1/reject — authorized', async () => {
      const res = await request(app.getHttpServer()).put('/claim/1/reject').set('Authorization', 'Bearer t').send({ catatanAdmin: 'Ditolak' });
      expect(res.status).toBe(200);
    });
    it('GET /claim — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).get('/claim').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 8. AUDIT ────────────────────────────────────────────────────

  describe('AuditController', () => {
    let app: INestApplication;
    let auditService: ReturnType<typeof createAuditMock>;

    beforeAll(async () => {
      auditService = createAuditMock();
      const { AuditController } = await import('../audit/audit.controller.js');
      const module = await Test.createTestingModule({
        controllers: [AuditController],
        providers: [
          { provide: await import('../audit/audit.service.js').then(m => m.AuditService), useValue: auditService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /audit — authorized superadmin', async () => {
      const res = await request(app.getHttpServer()).get('/audit').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /audit — unauthorized role (403)', async () => {
      mockUserRole = 'pelatih';
      const res = await request(app.getHttpServer()).get('/audit').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 9. LATIHAN ──────────────────────────────────────────────────

  describe('LatihanController', () => {
    let app: INestApplication;
    let latihanService: ReturnType<typeof createLatihanMock>;

    beforeAll(async () => {
      latihanService = createLatihanMock();
      const { LatihanController } = await import('../latihan/latihan.controller.js');
      const module = await Test.createTestingModule({
        controllers: [LatihanController],
        providers: [
          { provide: await import('../latihan/latihan.service.js').then(m => m.LatihanService), useValue: latihanService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /latihan', async () => {
      const res = await request(app.getHttpServer()).post('/latihan').set('Authorization', 'Bearer t').send({ rantingId: 1, hariTanggal: '2026-06-01', lokasi: 'Aula', jenisMateri: 'Dasar' });
      expect(res.status).toBe(201);
    });
    it('GET /latihan', async () => {
      const res = await request(app.getHttpServer()).get('/latihan');
      expect(res.status).toBe(200);
    });
    it('GET /latihan/1', async () => {
      const res = await request(app.getHttpServer()).get('/latihan/1');
      expect(res.status).toBe(200);
    });
    it('POST /latihan — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).post('/latihan').set('Authorization', 'Bearer t').send({ rantingId: 1, hariTanggal: '2026-06-01', lokasi: 'Aula', jenisMateri: 'Dasar' });
      expect(res.status).toBe(403);
    });
  });

  // ── 10. USERS ───────────────────────────────────────────────────

  describe('UsersController', () => {
    let app: INestApplication;
    let usersService: ReturnType<typeof createUsersMock>;

    beforeAll(async () => {
      usersService = createUsersMock();
      const { UsersController } = await import('../users/users.controller.js');
      const module = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
          { provide: await import('../users/users.service.js').then(m => m.UsersService), useValue: usersService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /users', async () => {
      const res = await request(app.getHttpServer()).get('/users').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /users/1', async () => {
      const res = await request(app.getHttpServer()).get('/users/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('POST /users', async () => {
      const res = await request(app.getHttpServer()).post('/users').set('Authorization', 'Bearer t').send({ username: 'newuser', nomorHp: '081000', password: 'pass123', roleId: 1 });
      expect(res.status).toBe(201);
    });
    it('PUT /users/1', async () => {
      const res = await request(app.getHttpServer()).put('/users/1').set('Authorization', 'Bearer t').send({ email: 'test@test.com' });
      expect(res.status).toBe(200);
    });
    it('DELETE /users/1', async () => {
      const res = await request(app.getHttpServer()).delete('/users/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /users — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).get('/users').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 11. ROLES ───────────────────────────────────────────────────

  describe('RolesController', () => {
    let app: INestApplication;
    let rolesService: ReturnType<typeof createRolesMock>;

    beforeAll(async () => {
      rolesService = createRolesMock();
      const { RolesController } = await import('../roles/roles.controller.js');
      const module = await Test.createTestingModule({
        controllers: [RolesController],
        providers: [
          { provide: await import('../roles/roles.service.js').then(m => m.RolesService), useValue: rolesService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /roles', async () => {
      const res = await request(app.getHttpServer()).get('/roles').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /roles/1', async () => {
      const res = await request(app.getHttpServer()).get('/roles/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('POST /roles', async () => {
      const res = await request(app.getHttpServer()).post('/roles').set('Authorization', 'Bearer t').send({ nama: 'newrole', scope: 'ranting', permissions: [] });
      expect(res.status).toBe(201);
    });
    it('PUT /roles/1', async () => {
      const res = await request(app.getHttpServer()).put('/roles/1').set('Authorization', 'Bearer t').send({ nama: 'updated' });
      expect(res.status).toBe(200);
    });
    it('DELETE /roles/1', async () => {
      const res = await request(app.getHttpServer()).delete('/roles/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    // Note: GET /roles has no @Roles() decorator, so any role can access
    it('DELETE /roles/1 — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).delete('/roles/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 12. PUSTAKA ─────────────────────────────────────────────────
  // Note: PustakaController only uses AuthGuard('jwt') without RolesGuard
  // So any authenticated user (regardless of role) can access

  describe('PustakaController', () => {
    let app: INestApplication;
    let pustakaService: ReturnType<typeof createPustakaMock>;

    beforeAll(async () => {
      pustakaService = createPustakaMock();
      const { PustakaController } = await import('../pustaka/pustaka.controller.js');
      const module = await Test.createTestingModule({
        controllers: [PustakaController],
        providers: [
          { provide: await import('../pustaka/pustaka.service.js').then(m => m.PustakaService), useValue: pustakaService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /pustaka — public (no auth needed)', async () => {
      const res = await request(app.getHttpServer()).get('/pustaka');
      expect(res.status).toBe(200);
    });
    it('POST /pustaka — any authenticated user', async () => {
      mockUserRole = 'anggota'; // Pustaka has no RolesGuard, so any role works
      const res = await request(app.getHttpServer()).post('/pustaka').set('Authorization', 'Bearer t').send({ judul: 'Test', jenis: 'Modul', fileUrl: 'https://example.com/test.pdf' });
      expect(res.status).toBe(201);
    });
  });

  // ── 13. KONTEN ──────────────────────────────────────────────────

  describe('KontenController', () => {
    let app: INestApplication;
    let kontenService: ReturnType<typeof createKontenMock>;

    beforeAll(async () => {
      kontenService = createKontenMock();
      const { KontenController } = await import('../konten/konten.controller.js');
      const module = await Test.createTestingModule({
        controllers: [KontenController],
        providers: [
          { provide: await import('../konten/konten.service.js').then(m => m.KontenService), useValue: kontenService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('GET /konten/published — public', async () => {
      const res = await request(app.getHttpServer()).get('/konten/published');
      expect(res.status).toBe(200);
    });
    it('GET /konten — admin authorized', async () => {
      const res = await request(app.getHttpServer()).get('/konten').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('POST /konten — any authenticated user (only AuthGuard)', async () => {
      const res = await request(app.getHttpServer()).post('/konten').set('Authorization', 'Bearer t').send({ judul: 'Test', jenis: 'Artikel', konten: '<p>Test</p>' });
      expect(res.status).toBe(201);
    });
    it('PUT /konten/1/review — admin authorized', async () => {
      const res = await request(app.getHttpServer()).put('/konten/1/review').set('Authorization', 'Bearer t').send({ status: 'Dipublikasikan' });
      expect(res.status).toBe(200);
    });
    it('GET /konten — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).get('/konten').set('Authorization', 'Bearer t');
      expect(res.status).toBe(403);
    });
  });

  // ── 14. IURAN ───────────────────────────────────────────────────

  describe('IuranController', () => {
    let app: INestApplication;
    let iuranService: ReturnType<typeof createIuranMock>;

    beforeAll(async () => {
      iuranService = createIuranMock();
      const { IuranController } = await import('../iuran/iuran.controller.js');
      const module = await Test.createTestingModule({
        controllers: [IuranController],
        providers: [
          { provide: await import('../iuran/iuran.service.js').then(m => m.IuranService), useValue: iuranService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /iuran — create pembayaran', async () => {
      const res = await request(app.getHttpServer()).post('/iuran').set('Authorization', 'Bearer t').send({ jenisIuranId: 1, anggotaId: 1, jumlahBayar: 50000, tanggalBayar: '2026-06-01' });
      expect(res.status).toBe(201);
    });
    it('GET /iuran — list pembayaran', async () => {
      const res = await request(app.getHttpServer()).get('/iuran').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /iuran/status/1', async () => {
      const res = await request(app.getHttpServer()).get('/iuran/status/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /iuran/dashboard/stats', async () => {
      const res = await request(app.getHttpServer()).get('/iuran/dashboard/stats').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('GET /iuran/dashboard/monthly', async () => {
      const res = await request(app.getHttpServer()).get('/iuran/dashboard/monthly').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
    it('POST /iuran — unauthorized role (403)', async () => {
      mockUserRole = 'anggota';
      const res = await request(app.getHttpServer()).post('/iuran').set('Authorization', 'Bearer t').send({ jenisIuranId: 1, anggotaId: 1, jumlahBayar: 50000, tanggalBayar: '2026-06-01' });
      expect(res.status).toBe(403);
    });
  });

  // ── 15. ABSENSI ─────────────────────────────────────────────────

  describe('AbsensiController', () => {
    let app: INestApplication;
    let absensiService: ReturnType<typeof createAbsensiMock>;

    beforeAll(async () => {
      absensiService = createAbsensiMock();

      const { AbsensiController } = await import('../absensi/absensi.controller.js');
      const module = await Test.createTestingModule({
        controllers: [AbsensiController],
        providers: [
          { provide: await import('../absensi/absensi.service.js').then(m => m.AbsensiService), useValue: absensiService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /absensi/kegiatan — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/absensi/kegiatan').set('Authorization', 'Bearer t').send({ kegiatanId: 1, checkinTime: '2026-06-01T08:00:00Z' });
      expect(res.status).toBe(201);
    });
    it('GET /absensi/kegiatan/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).get('/absensi/kegiatan/1');
      expect(res.status).toBe(200);
    });
    it('POST /absensi/latihan — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/absensi/latihan').set('Authorization', 'Bearer t').send({ latihanId: 1, checkinTime: '2026-06-01T19:00:00Z' });
      expect(res.status).toBe(201);
    });
    it('POST /absensi/latihan/bulk — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/absensi/latihan/bulk').set('Authorization', 'Bearer t').send({ latihanId: 1, entries: [{ anggotaId: 1, hadir: true }] });
      expect(res.status).toBe(201);
    });
    it('GET /absensi/latihan/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).get('/absensi/latihan/1');
      expect(res.status).toBe(200);
    });
  });

  // ── 16. ORGANISASI-DOKUMEN ──────────────────────────────────────

  describe('OrganisasiDokumenController', () => {
    let app: INestApplication;
    let organisasiDokumenService: ReturnType<typeof createOrganisasiDokumenMock>;

    beforeAll(async () => {
      organisasiDokumenService = createOrganisasiDokumenMock();

      const { OrganisasiDokumenController } = await import('../organisasi-dokumen/organisasi-dokumen.controller.js');
      const module = await Test.createTestingModule({
        controllers: [OrganisasiDokumenController],
        providers: [
          { provide: await import('../organisasi-dokumen/organisasi-dokumen.service.js').then(m => m.OrganisasiDokumenService), useValue: organisasiDokumenService },
          Reflector,
          RolesGuard,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    it('POST /organisasi-dokumen — authorized', async () => {
      const res = await request(app.getHttpServer()).post('/organisasi-dokumen').set('Authorization', 'Bearer t').send({ judul: 'Dokumen Test', kategori: 'SK', filePath: '/path/doc.pdf' });
      expect(res.status).toBe(201);
    });
    it('GET /organisasi-dokumen — public', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi-dokumen');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi-dokumen/kategori/SK', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi-dokumen/kategori/SK');
      expect(res.status).toBe(200);
    });
    it('GET /organisasi-dokumen/1', async () => {
      const res = await request(app.getHttpServer()).get('/organisasi-dokumen/1');
      expect(res.status).toBe(200);
    });
    it('PUT /organisasi-dokumen/1 — authorized', async () => {
      const res = await request(app.getHttpServer()).put('/organisasi-dokumen/1').set('Authorization', 'Bearer t').send({ judul: 'Updated' });
      expect(res.status).toBe(200);
    });
    it('DELETE /organisasi-dokumen/1 — superadmin only', async () => {
      const res = await request(app.getHttpServer()).delete('/organisasi-dokumen/1').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
  });
});
