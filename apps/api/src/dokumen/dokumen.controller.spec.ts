import { Test } from '@nestjs/testing';
import { DokumenController } from './dokumen.controller.js';
import { DokumenService } from './dokumen.service.js';
import type { Response } from 'express';

describe('DokumenController', () => {
  let controller: DokumenController;
  let dokumenService: jest.Mocked<DokumenService>;

  beforeEach(async () => {
    dokumenService = {
      generateKartuAnggota: jest.fn(),
      generateSertifikat: jest.fn(),
      generatePiagam: jest.fn(),
      verifyDocument: jest.fn(),
      getDocumentUrl: jest.fn(),
      revokeDocument: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [DokumenController],
      providers: [
        { provide: DokumenService, useValue: dokumenService },
      ],
    }).compile();

    controller = module.get(DokumenController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateKartu', () => {
    it('should call generateKartuAnggota with converted params', async () => {
      const req = { user: { id: 2 } };
      dokumenService.generateKartuAnggota.mockResolvedValue({ id: 1, fileUrl: 'https://url/kartu.pdf' } as any);

      const result = await controller.generateKartu('5', req);

      expect(dokumenService.generateKartuAnggota).toHaveBeenCalledWith(5, 2);
      expect(result).toEqual({ id: 1, fileUrl: 'https://url/kartu.pdf' });
    });
  });

  describe('generateSertifikat', () => {
    it('should call generateSertifikat with converted params', async () => {
      const req = { user: { id: 2 } };
      dokumenService.generateSertifikat.mockResolvedValue({ id: 1, nomorSertifikat: 'S-001' } as any);

      const result = await controller.generateSertifikat('10', '5', req);

      expect(dokumenService.generateSertifikat).toHaveBeenCalledWith(10, 5, 2);
      expect(result).toEqual({ id: 1, nomorSertifikat: 'S-001' });
    });
  });

  describe('generatePiagam', () => {
    it('should call generatePiagam with converted params and prestasi body', async () => {
      const req = { user: { id: 2 } };
      dokumenService.generatePiagam.mockResolvedValue({ id: 1, prestasi: 'Juara 1' } as any);

      const result = await controller.generatePiagam('5', 'Juara 1', req);

      expect(dokumenService.generatePiagam).toHaveBeenCalledWith(5, 'Juara 1', 2);
      expect(result).toEqual({ id: 1, prestasi: 'Juara 1' });
    });
  });

  describe('verify', () => {
    it('should call verifyDocument with token param', async () => {
      dokumenService.verifyDocument.mockResolvedValue({ type: 'kartu_anggota', data: { namaLengkap: 'John' } } as any);

      const result = await controller.verify('qr-token-123');

      expect(dokumenService.verifyDocument).toHaveBeenCalledWith('qr-token-123');
      expect(result).toEqual({ type: 'kartu_anggota', data: { namaLengkap: 'John' } });
    });
  });

  describe('download', () => {
    it('should redirect to document URL by type', async () => {
      const res = { redirect: jest.fn() } as unknown as Response;
      dokumenService.getDocumentUrl.mockResolvedValue('https://storage/kartu.pdf');

      await controller.download('5', 'KARTU_ANGGOTA', res);

      expect(dokumenService.getDocumentUrl).toHaveBeenCalledWith(5, 'KARTU_ANGGOTA');
      expect(res.redirect).toHaveBeenCalledWith('https://storage/kartu.pdf');
    });
  });

  describe('revoke', () => {
    it('should call revokeDocument with parsed id', async () => {
      dokumenService.revokeDocument.mockResolvedValue({ id: 3, status: 'revoked' } as any);

      const result = await controller.revoke('3');

      expect(dokumenService.revokeDocument).toHaveBeenCalledWith(3);
      expect(result).toEqual({ id: 3, status: 'revoked' });
    });
  });
});
