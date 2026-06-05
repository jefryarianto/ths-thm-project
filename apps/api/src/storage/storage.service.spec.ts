import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service.js';

// ─── Mock S3 SDK ───
const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn();
let capturedS3Config: any = null;

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation((config: any) => {
    capturedS3Config = config;
    return { send: mockSend };
  }),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    jest.clearAllMocks();
    capturedS3Config = null;
    // Reset all MINIO/S3 env vars to defaults
    delete process.env.MINIO_ENDPOINT;
    delete process.env.MINIO_PORT;
    delete process.env.S3_REGION;
    delete process.env.MINIO_ACCESS_KEY;
    delete process.env.MINIO_SECRET_KEY;
    delete process.env.MINIO_BUCKET;
  });

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();
    return module.get<StorageService>(StorageService);
  }

  // ──────────────────────────────────────────────
  //  constructor — env var fallbacks
  // ──────────────────────────────────────────────

  describe('constructor', () => {
    it('should use default values when no env vars are set', async () => {
      service = await createService();

      expect(capturedS3Config).toMatchObject({
        endpoint: 'http://localhost:9000',
        region: 'auto',
        credentials: {
          accessKeyId: 'minioadmin',
          secretAccessKey: 'minioadmin',
        },
        forcePathStyle: true,
      });
      expect((service as any).bucket).toBe('ths-thm-docs');
    });

    it('should use MINIO_ENDPOINT and MINIO_PORT env vars', async () => {
      process.env.MINIO_ENDPOINT = 'minio.example.com';
      process.env.MINIO_PORT = '9001';

      service = await createService();

      expect(capturedS3Config.endpoint).toBe('http://minio.example.com:9001');
    });

    it('should use S3_REGION env var', async () => {
      process.env.S3_REGION = 'us-east-1';

      service = await createService();

      expect(capturedS3Config.region).toBe('us-east-1');
    });

    it('should use MINIO_ACCESS_KEY and MINIO_SECRET_KEY env vars', async () => {
      process.env.MINIO_ACCESS_KEY = 'custom-key';
      process.env.MINIO_SECRET_KEY = 'custom-secret';

      service = await createService();

      expect(capturedS3Config.credentials).toEqual({
        accessKeyId: 'custom-key',
        secretAccessKey: 'custom-secret',
      });
    });

    it('should use MINIO_BUCKET env var', async () => {
      process.env.MINIO_BUCKET = 'custom-bucket';

      service = await createService();

      expect((service as any).bucket).toBe('custom-bucket');
    });
  });

  // Create default service for method tests
  beforeEach(async () => {
    service = await createService();
  });

  // ──────────────────────────────────────────────
  //  uploadFile()
  // ──────────────────────────────────────────────

  describe('uploadFile', () => {
    it('should upload file and return key', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.uploadFile('docs/surat.pdf', Buffer.from('test'), 'application/pdf');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(result).toBe('docs/surat.pdf');
    });
  });

  // ──────────────────────────────────────────────
  //  getFileUrl()
  // ──────────────────────────────────────────────

  describe('getFileUrl', () => {
    it('should return presigned URL', async () => {
      mockGetSignedUrl.mockResolvedValue('https://minio.example.com/ths-thm-docs/test-file.pdf?signature=abc');

      const result = await service.getFileUrl('test-file.pdf');

      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe('https://minio.example.com/ths-thm-docs/test-file.pdf?signature=abc');
    });
  });

  // ──────────────────────────────────────────────
  //  deleteFile()
  // ──────────────────────────────────────────────

  describe('deleteFile', () => {
    it('should delete file by key', async () => {
      mockSend.mockResolvedValue({});

      await service.deleteFile('docs/old-surat.pdf');

      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});
