import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard, ROLES_KEY, PERMISSIONS_KEY } from './roles.guard.js';

function createMockContext(user: any, metadata: Record<string, any>): any {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  };
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when no roles or permissions are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const context = createMockContext({ role: 'admin' }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === ROLES_KEY) return ['superadmin', 'admin_distrik'];
      return undefined;
    });

    const context = createMockContext({ role: 'superadmin' }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === ROLES_KEY) return ['superadmin'];
      return undefined;
    });

    const context = createMockContext({ role: 'admin_distrik' }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should allow access when user has required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === PERMISSIONS_KEY) return ['manage_users'];
      return undefined;
    });

    const context = createMockContext({ role: 'admin', permissions: ['manage_users', 'read'] }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access when user lacks required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === PERMISSIONS_KEY) return ['manage_users'];
      return undefined;
    });

    const context = createMockContext({ role: 'admin', permissions: ['read'] }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should require both role AND permission when both are specified', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === ROLES_KEY) return ['superadmin'];
      if (key === PERMISSIONS_KEY) return ['manage_users'];
      return undefined;
    });

    const context = createMockContext({ role: 'superadmin', permissions: ['manage_users'] }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny when role matches but permission does not', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === ROLES_KEY) return ['superadmin'];
      if (key === PERMISSIONS_KEY) return ['manage_users'];
      return undefined;
    });

    const context = createMockContext({ role: 'superadmin', permissions: ['read'] }, {});
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should handle missing permissions array on user', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === PERMISSIONS_KEY) return ['manage_users'];
      return undefined;
    });

    const context = createMockContext({ role: 'admin' }, {}); // no permissions property
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
