import { FirebaseService } from '../../firebase/firebase.service.js';

/**
 * Create a mock FirebaseService.
 */
export function createFirebaseMock(): jest.Mocked<FirebaseService> {
  return {
    sendPush: jest.fn(),
    sendSilentPush: jest.fn(),
    sendMulticast: jest.fn(),
  } as unknown as jest.Mocked<FirebaseService>;
}
