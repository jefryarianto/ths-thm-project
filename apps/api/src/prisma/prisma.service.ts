import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService manages the PrismaClient connection lifecycle.
 *
 * Uses composition over inheritance: creates a PrismaClient internally
 * and delegates all property access (user, anggota, $queryRaw, etc.)
 * to it via a Proxy. This makes the service fully testable without
 * needing to mock the PrismaClient class at the module level.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Index signature allows the Proxy to delegate arbitrary PrismaClient
  // model properties (user, anggota, $queryRaw, etc.) through TypeScript.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();

    // Return a Proxy that forwards property access to the underlying
    // PrismaClient for all properties not defined on this class.
    // This means `service.user.findUnique()` works even though `user`
    // is not explicitly declared on PrismaService.
    return new Proxy(this, {
      get: (target, prop) => {
        // Own properties (onModuleInit, onModuleDestroy, _prisma)
        if (prop in target || typeof prop === 'symbol') {
          return (target as any)[prop];
        }
        // Delegate everything else to PrismaClient
        return (target._prisma as any)[prop];
      },
    }) as PrismaService;
  }

  async onModuleInit() {
    await this._prisma.$connect();
  }

  async onModuleDestroy() {
    await this._prisma.$disconnect();
  }
}
