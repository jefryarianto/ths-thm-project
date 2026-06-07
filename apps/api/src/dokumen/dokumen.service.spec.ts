import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DokumenService } from './dokumen.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';
import { createStorageMock } from '../test/mocks/storage.mock.js';
import QRCode from 'qrcode';
import { ulid } from 'ulid';

jest.mock('qrcode', () => ({ toDataURL: jest.fn() }));
jest.mock('ulid', () => ({ ulid: jest.fn() }));
jest.mock('@ths-thm/templates', () => ({
  renderKartuAnggota: jest.fn(() => '<html>Kartu Anggota</html>'),
  renderSertifikatPendadaran: jest.fn(() => '<html>Sertifikat</html>'),
  renderPiagamPrestasi: jest.fn(() => '<html>Piagam</html>'),
}));

// Mock playwright for renderHtmlToPdf testing
// chromium.launch can be accessed via require('playwright').chromium.launch for per-test configuration
jest.mock('playwright', () => {
  const mockLaunch = jest.fn().mockRejectedValue(new Error('Chromium not available in test environment'));
  return { chromium: { launch: mockLaunch } };
}, { virtual: true });

const mockAnggota = {
  id: 10, uuid: 'anggota-uuid', nomorAnggota: 'THS-001', namaLengkap: 'Budi Santoso',
  tempatLahir: 'Jakarta', tanggalLahir: new Date('2000-01-15'),
  jenisKelamin: 'L', statusKeanggotaan: 'aktif', statusData: 'lengkap', statusValidasi: 'tervalidasi',
  ranting: { id: 5, nama: 'Ranting Cisarua' },
};

const mockIssuedDocument = {
  id: 1, uuid: 'doc-uuid', documentTypeId: 1, anggotaId: 10,
  nomorDokumen: 'DOC-THS-001-2025', title: 'Kartu Anggota',
  status: 'diterbitkan', filePath: 'documents/10/token123.pdf',
  qrToken: 'token123', createdAt: new Date('2025-01-01'),
};

describe('DokumenService', () => {
  let service: DokumenService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let storage: jest.Mocked<StorageService>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    storage = createStorageMock();
    (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,qrcode');
    (ulid as jest.Mock).mockReturnValue('mock-ulid-token');
    jest.spyOn(DokumenService.prototype as any, 'renderHtmlToPdf').mockResolvedValue(Buffer.from('mock-pdf'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DokumenService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();
    service = module.get<DokumenService>(DokumenService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  describe('generateKartuAnggota', () => {
    it('should generate kartu anggota successfully', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(mockAnggota);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 1, code: 'KARTU_ANGGOTA' });
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue({ id: 1, isActive: true });
      storage.uploadFile.mockResolvedValue('documents/10/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockIssuedDocument);

      const result = await service.generateKartuAnggota(10, 1);
      expect(prisma.anggota.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
        include: { ranting: { include: { wilayah: { include: { distrik: true } } } } },
      });
      expect(result).toEqual(mockIssuedDocument);
    });

    it('should throw NotFoundException when anggota not found', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.generateKartuAnggota(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should handle null docType and template (fallback defaults)', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(mockAnggota);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue(null);
      storage.uploadFile.mockResolvedValue('documents/10/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockIssuedDocument);

      await service.generateKartuAnggota(10, 1);

      expect(prisma.issuedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ documentTypeId: 1, templateId: 1 }),
        }),
      );
    });
  });

  describe('verifyDocument', () => {
    it('should verify document by qrToken', async () => {
      (prisma.issuedDocument.findUnique as jest.Mock).mockResolvedValue({
        ...mockIssuedDocument, anggota: mockAnggota, documentType: { code: 'kartu_anggota' },
      });
      const result = await service.verifyDocument('token123');
      expect(result.type).toBe('kartu_anggota');
    });

    it('should throw NotFoundException when no document matches', async () => {
      (prisma.issuedDocument.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.verifyDocument('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should return revoked status when document is revoked', async () => {
      (prisma.issuedDocument.findUnique as jest.Mock).mockResolvedValue({
        ...mockIssuedDocument,
        status: 'revoked',
        documentType: { code: 'kartu_anggota' },
      });

      const result = await service.verifyDocument('revoked-token');

      expect(result).toEqual({
        status: 'revoked',
        message: 'This document has been revoked',
      });
      expect(prisma.documentValidationLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          qrToken: 'revoked-token',
          validationResult: 'revoked',
          validatedBy: 0,
        }),
      });
    });
  });

  describe('getDocumentUrl', () => {
    it('should return signed URL for latest document by type', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 1, code: 'KARTU_ANGGOTA' });
      (prisma.issuedDocument.findFirst as jest.Mock).mockResolvedValue(mockIssuedDocument);
      storage.getFileUrl.mockResolvedValue('https://storage.example.com/doc.pdf');
      const result = await service.getDocumentUrl(10, 'KARTU_ANGGOTA');
      expect(prisma.documentType.findUnique).toHaveBeenCalledWith({ where: { code: 'KARTU_ANGGOTA' } });
      expect(prisma.issuedDocument.findFirst).toHaveBeenCalledWith({
        where: { anggotaId: 10, documentTypeId: 1, status: 'issued' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toBe('https://storage.example.com/doc.pdf');
    });

    it('should throw NotFoundException when no document found for the type', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 2, code: 'SERTIFIKAT_PENDADARAN' });
      (prisma.issuedDocument.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getDocumentUrl(10, 'SERTIFIKAT_PENDADARAN')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when document has no filePath', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 1, code: 'KARTU_ANGGOTA' });
      (prisma.issuedDocument.findFirst as jest.Mock).mockResolvedValue({ ...mockIssuedDocument, filePath: null });

      await expect(service.getDocumentUrl(10, 'KARTU_ANGGOTA')).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  generateSertifikat()
  // ──────────────────────────────────────────────

  describe('generateSertifikat', () => {
    const mockCalon = { id: 20, uuid: 'calon-uuid', namaLengkap: 'Calon Peserta' };
    const mockHasil = {
      kegiatanId: 5, calonAnggotaId: 20,
      totalSkor: { toNumber: () => 80 } as any,
      statusKelulusan: 'lulus',
    };
    const mockKegiatan = { id: 5, nama: 'Pendadaran Karate', lokasi: 'Aula' };
    const mockAspek = [{
      id: 1, namaAspek: 'Teknik',
      itemPenilaian: [{ id: 1, namaItem: 'Kuda-kuda', isActive: true, urutan: 1 }],
    }];
    const mockSertifikatDoc = {
      id: 2, uuid: 'sertif-uuid', documentTypeId: 2, calonAnggotaId: 20, kegiatanId: 5,
      nomorDokumen: 'SPD-20-2025', title: 'Sertifikat Pendadaran - Calon Peserta',
      status: 'issued', filePath: 'sertifikat/20/mock-ulid-token.pdf',
      qrToken: 'mock-ulid-token', createdAt: new Date('2025-01-01'),
    };

    it('should generate sertifikat successfully', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(mockCalon);
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue(mockHasil);
      (prisma.kegiatan.findUnique as jest.Mock).mockResolvedValue(mockKegiatan);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 2, code: 'SERTIFIKAT_PENDADARAN' });
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue({ id: 2, isActive: true });
      (prisma.aspekPenilaian.findMany as jest.Mock).mockResolvedValue(mockAspek);
      storage.uploadFile.mockResolvedValue('sertifikat/20/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockSertifikatDoc);

      const result = await service.generateSertifikat(20, 5, 1);

      expect(prisma.calonAnggota.findUnique).toHaveBeenCalledWith({ where: { id: 20 } });
      expect(prisma.hasilPendadaran.findUnique).toHaveBeenCalledWith({
        where: { kegiatanId_calonAnggotaId: { kegiatanId: 5, calonAnggotaId: 20 } },
      });
      expect(storage.uploadFile).toHaveBeenCalled();
      expect(result).toEqual(mockSertifikatDoc);
    });

    it('should throw NotFoundException when calonAnggota not found', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.generateSertifikat(999, 5, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when hasil pendadaran not found', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(mockCalon);
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.generateSertifikat(20, 999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should calculate predikat correctly for low scores (Cukup)', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(mockCalon);
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue({
        ...mockHasil,
        totalSkor: { toNumber: () => 60 } as any,
      });
      (prisma.kegiatan.findUnique as jest.Mock).mockResolvedValue(mockKegiatan);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 2, code: 'SERTIFIKAT_PENDADARAN' });
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue({ id: 2, isActive: true });
      (prisma.aspekPenilaian.findMany as jest.Mock).mockResolvedValue(mockAspek);
      storage.uploadFile.mockResolvedValue('sertifikat/20/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockSertifikatDoc);

      await service.generateSertifikat(20, 5, 1);

      expect(prisma.issuedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: expect.objectContaining({ predikat: 'Cukup' }),
          }),
        }),
      );
    });

    it('should calculate predikat correctly for middle scores (Baik)', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(mockCalon);
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue({
        ...mockHasil,
        totalSkor: { toNumber: () => 70 } as any,
      });
      (prisma.kegiatan.findUnique as jest.Mock).mockResolvedValue(mockKegiatan);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 2, code: 'SERTIFIKAT_PENDADARAN' });
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue({ id: 2, isActive: true });
      (prisma.aspekPenilaian.findMany as jest.Mock).mockResolvedValue(mockAspek);
      storage.uploadFile.mockResolvedValue('sertifikat/20/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockSertifikatDoc);

      await service.generateSertifikat(20, 5, 1);

      expect(prisma.issuedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: expect.objectContaining({ predikat: 'Baik' }),
          }),
        }),
      );
    });

    it('should handle null docType and template (fallback defaults)', async () => {
      (prisma.calonAnggota.findUnique as jest.Mock).mockResolvedValue(mockCalon);
      (prisma.hasilPendadaran.findUnique as jest.Mock).mockResolvedValue(mockHasil);
      (prisma.kegiatan.findUnique as jest.Mock).mockResolvedValue(mockKegiatan);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.aspekPenilaian.findMany as jest.Mock).mockResolvedValue(mockAspek);
      storage.uploadFile.mockResolvedValue('sertifikat/20/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockSertifikatDoc);

      await service.generateSertifikat(20, 5, 1);

      expect(prisma.issuedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ documentTypeId: 2, templateId: 1 }),
        }),
      );
    });
  });

  // ──────────────────────────────────────────────
  //  generatePiagam()
  // ──────────────────────────────────────────────

  describe('generatePiagam', () => {
    const mockPiagamDoc = {
      id: 3, uuid: 'piagam-uuid', documentTypeId: 3, anggotaId: 10,
      nomorDokumen: 'PG-THS-001-2025', title: 'Piagam Prestasi - Budi Santoso',
      status: 'issued', filePath: 'piagam/10/mock-ulid-token.pdf',
      qrToken: 'mock-ulid-token', createdAt: new Date('2025-01-01'),
    };

    it('should generate piagam successfully', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(mockAnggota);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 3, code: 'PIAGAM_PRESTASI' });
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue({ id: 3, isActive: true });
      storage.uploadFile.mockResolvedValue('piagam/10/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockPiagamDoc);

      const result = await service.generatePiagam(10, 'Juara 1 Karate', 1);

      expect(prisma.anggota.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(storage.uploadFile).toHaveBeenCalled();
      expect(prisma.issuedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: { prestasi: 'Juara 1 Karate' },
          }),
        }),
      );
      expect(result).toEqual(mockPiagamDoc);
    });

    it('should throw NotFoundException when anggota not found', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.generatePiagam(999, 'Prestasi', 1)).rejects.toThrow(NotFoundException);
    });

    it('should handle null docType and template (fallback defaults)', async () => {
      (prisma.anggota.findUnique as jest.Mock).mockResolvedValue(mockAnggota);
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.documentTemplate.findFirst as jest.Mock).mockResolvedValue(null);
      storage.uploadFile.mockResolvedValue('piagam/10/mock-ulid-token.pdf');
      (prisma.issuedDocument.create as jest.Mock).mockResolvedValue(mockPiagamDoc);

      await service.generatePiagam(10, 'Juara 1', 1);

      expect(prisma.issuedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ documentTypeId: 3, templateId: 1 }),
        }),
      );
    });

  });

  // ──────────────────────────────────────────────
  //  revokeDocument()
  // ──────────────────────────────────────────────

  describe('revokeDocument', () => {
    it('should revoke an issued document', async () => {
      const revokedDoc = { ...mockIssuedDocument, status: 'revoked' };
      (prisma.issuedDocument.update as jest.Mock).mockResolvedValue(revokedDoc);

      const result = await service.revokeDocument(1);

      expect(prisma.issuedDocument.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'revoked' },
      });
      expect(result.status).toBe('revoked');
    });
  });

  // ──────────────────────────────────────────────
  //  Document Types CRUD
  // ──────────────────────────────────────────────

  describe('createDocumentType', () => {
    it('should create a document type', async () => {
      const data = { code: 'SURAT_KETERANGAN', name: 'Surat Keterangan', category: 'surat' };
      (prisma.documentType.create as jest.Mock).mockResolvedValue({ id: 4, ...data, isActive: true });

      const result = await service.createDocumentType(data);

      expect(prisma.documentType.create).toHaveBeenCalledWith({ data });
      expect(result.code).toBe('SURAT_KETERANGAN');
    });
  });

  describe('findAllDocumentTypes', () => {
    it('should return all document types with counts', async () => {
      const types = [
        { id: 1, code: 'KARTU_ANGGOTA', _count: { documentTemplates: 2, issuedDocuments: 10 } },
      ];
      (prisma.documentType.findMany as jest.Mock).mockResolvedValue(types);

      const result = await service.findAllDocumentTypes();

      expect(prisma.documentType.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { documentTemplates: true, issuedDocuments: true } } },
      });
      expect(result).toEqual(types);
    });
  });

  describe('findDocumentTypeById', () => {
    it('should return document type with templates, signers, stamps', async () => {
      const type = { id: 1, code: 'KARTU_ANGGOTA', documentTemplates: [], documentSigners: [], documentStamps: [] };
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(type);

      const result = await service.findDocumentTypeById(1);

      expect(prisma.documentType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          documentTemplates: { where: { isActive: true } },
          documentSigners: { where: { isActive: true } },
          documentStamps: { where: { isActive: true } },
        },
      });
      expect(result).toEqual(type);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findDocumentTypeById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDocumentType', () => {
    it('should update document type', async () => {
      const type = { id: 1, code: 'KARTU_ANGGOTA', isActive: true };
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(type);
      (prisma.documentType.update as jest.Mock).mockResolvedValue({ ...type, isActive: false });

      const result = await service.updateDocumentType(1, { isActive: false });

      expect(prisma.documentType.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isActive: false } });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateDocumentType(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDocumentType', () => {
    it('should soft-delete document type by setting isActive=false', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue({ id: 1, isActive: true });
      (prisma.documentType.update as jest.Mock).mockResolvedValue({ id: 1, isActive: false });

      const result = await service.deleteDocumentType(1);

      expect(prisma.documentType.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isActive: false } });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentType.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteDocumentType(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  Document Templates CRUD
  // ──────────────────────────────────────────────

  describe('createDocumentTemplate', () => {
    it('should upload file and create template record', async () => {
      const file = { originalname: 'template.html', buffer: Buffer.from('<html>'), mimetype: 'text/html' } as Express.Multer.File;
      const data = { documentTypeId: 1, name: 'Kartu Template v2' };
      storage.uploadFile.mockResolvedValue('document-templates/1/123.html');
      (prisma.documentTemplate.create as jest.Mock).mockResolvedValue({ id: 2, name: 'Kartu Template v2' });

      const result = await service.createDocumentTemplate(file, data, 1);

      expect(storage.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('document-templates/1/'),
        file.buffer,
        'text/html',
      );
      expect(prisma.documentTemplate.create).toHaveBeenCalled();
      expect(result.name).toBe('Kartu Template v2');
    });
  });

  describe('findAllDocumentTemplates', () => {
    it('should return all templates', async () => {
      (prisma.documentTemplate.findMany as jest.Mock).mockResolvedValue([{ id: 1, name: 'Template A' }]);

      const result = await service.findAllDocumentTemplates();

      expect(prisma.documentTemplate.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: { documentType: true, pembuat: { select: { id: true, name: true } } },
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by documentTypeId', async () => {
      (prisma.documentTemplate.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAllDocumentTemplates(1);

      expect(prisma.documentTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { documentTypeId: 1 } }),
      );
    });
  });

  describe('findDocumentTemplateById', () => {
    it('should return template with signed file URL', async () => {
      (prisma.documentTemplate.findUnique as jest.Mock).mockResolvedValue({
        id: 1, templateFilePath: 'document-templates/1/file.html',
        documentType: { id: 1 }, pembuat: { id: 1, name: 'Admin' },
      });
      storage.getFileUrl.mockResolvedValue('https://signed.url/file.html');

      const result = await service.findDocumentTemplateById(1);

      expect(storage.getFileUrl).toHaveBeenCalledWith('document-templates/1/file.html');
      expect(result.fileUrl).toBe('https://signed.url/file.html');
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findDocumentTemplateById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDocumentTemplate', () => {
    it('should delete file from storage and remove template record', async () => {
      (prisma.documentTemplate.findUnique as jest.Mock).mockResolvedValue({
        id: 1, templateFilePath: 'document-templates/1/file.html',
      });
      storage.deleteFile.mockResolvedValue(undefined);
      (prisma.documentTemplate.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteDocumentTemplate(1);

      expect(storage.deleteFile).toHaveBeenCalledWith('document-templates/1/file.html');
      expect(prisma.documentTemplate.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Template berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentTemplate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteDocumentTemplate(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  Document Signers CRUD
  // ──────────────────────────────────────────────

  describe('createDocumentSigner', () => {
    it('should upload signature and create signer record', async () => {
      const file = { originalname: 'ttd.png', buffer: Buffer.from('img'), mimetype: 'image/png' } as Express.Multer.File;
      storage.uploadFile.mockResolvedValue('document-signers/123-ttd.png');
      (prisma.documentSigner.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Kepala Distrik' });

      const result = await service.createDocumentSigner(file, { name: 'Kepala Distrik', position: 'Kepala' });

      expect(storage.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('document-signers/'),
        file.buffer,
        'image/png',
      );
      expect(result.name).toBe('Kepala Distrik');
    });
  });

  describe('findAllDocumentSigners', () => {
    it('should return signers with signed URLs', async () => {
      (prisma.documentSigner.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Kepala', signatureFilePath: 'signers/1.png', documentType: null },
      ]);
      storage.getFileUrl.mockResolvedValue('https://signed.url/1.png');

      const result = await service.findAllDocumentSigners();

      expect(result[0].signatureUrl).toBe('https://signed.url/1.png');
    });
  });

  describe('updateDocumentSigner', () => {
    it('should update signer metadata', async () => {
      (prisma.documentSigner.findUnique as jest.Mock).mockResolvedValue({ id: 1, name: 'Old Name' });
      (prisma.documentSigner.update as jest.Mock).mockResolvedValue({ id: 1, name: 'New Name' });

      const result = await service.updateDocumentSigner(1, { name: 'New Name' });

      expect(prisma.documentSigner.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'New Name' } });
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentSigner.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateDocumentSigner(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDocumentSigner', () => {
    it('should delete file and record', async () => {
      (prisma.documentSigner.findUnique as jest.Mock).mockResolvedValue({ id: 1, signatureFilePath: 'signers/1.png' });
      storage.deleteFile.mockResolvedValue(undefined);
      (prisma.documentSigner.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteDocumentSigner(1);

      expect(storage.deleteFile).toHaveBeenCalledWith('signers/1.png');
      expect(result).toEqual({ message: 'Signer berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentSigner.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteDocumentSigner(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  //  Document Stamps CRUD
  // ──────────────────────────────────────────────

  describe('createDocumentStamp', () => {
    it('should upload stamp image and create record', async () => {
      const file = { originalname: 'cap.png', buffer: Buffer.from('img'), mimetype: 'image/png' } as Express.Multer.File;
      storage.uploadFile.mockResolvedValue('document-stamps/123-cap.png');
      (prisma.documentStamp.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Cap Distrik' });

      const result = await service.createDocumentStamp(file, { name: 'Cap Distrik' });

      expect(storage.uploadFile).toHaveBeenCalled();
      expect(result.name).toBe('Cap Distrik');
    });
  });

  describe('findAllDocumentStamps', () => {
    it('should return stamps with signed URLs', async () => {
      (prisma.documentStamp.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Cap', stampFilePath: 'stamps/1.png', documentType: null },
      ]);
      storage.getFileUrl.mockResolvedValue('https://signed.url/cap.png');

      const result = await service.findAllDocumentStamps();

      expect(result[0].stampUrl).toBe('https://signed.url/cap.png');
    });
  });

  describe('deleteDocumentStamp', () => {
    it('should delete stamp file and record', async () => {
      (prisma.documentStamp.findUnique as jest.Mock).mockResolvedValue({ id: 1, stampFilePath: 'stamps/1.png' });
      storage.deleteFile.mockResolvedValue(undefined);
      (prisma.documentStamp.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteDocumentStamp(1);

      expect(storage.deleteFile).toHaveBeenCalledWith('stamps/1.png');
      expect(result).toEqual({ message: 'Stamp berhasil dihapus' });
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.documentStamp.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteDocumentStamp(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('renderHtmlToPdf', () => {
    it('should return placeholder buffer when playwright fails', async () => {
      // Restore the spy so the real implementation runs
      jest.spyOn(DokumenService.prototype as any, 'renderHtmlToPdf').mockRestore();

      const result = await (service as any).renderHtmlToPdf('<p>test</p>', 600, 450);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('PDF placeholder for document 600x450');
    });

    it('should successfully generate PDF when playwright is available', async () => {
      // Restore the spy so the real implementation runs
      jest.spyOn(DokumenService.prototype as any, 'renderHtmlToPdf').mockRestore();

      // Configure the playwright mock to succeed
      const { chromium } = require('playwright');
      const mockPage = {
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
      };
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined),
      };
      chromium.launch.mockResolvedValue(mockBrowser);

      const result = await (service as any).renderHtmlToPdf('<p>test</p>', 600, 450);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('mock-pdf-content');
      expect(mockPage.setContent).toHaveBeenCalledWith('<p>test</p>', { waitUntil: 'networkidle' });
      expect(mockPage.pdf).toHaveBeenCalledWith({ width: '600px', height: '450px', printBackground: true });
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
