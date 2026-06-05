import { StorageService } from '../../storage/storage.service.js';

/**
 * Create a mock StorageService.
 */
export function createStorageMock(): jest.Mocked<StorageService> {
  return {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;
}
