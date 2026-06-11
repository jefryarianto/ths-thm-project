import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RedisThrottlerStorageService } from './redis/redis-throttler-storage.service.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { AnggotaModule } from './anggota/anggota.module.js';
import { ClaimModule } from './claim/claim.module.js';
import { OrganisasiModule } from './organisasi/organisasi.module.js';
import { KegiatanModule } from './kegiatan/kegiatan.module.js';
import { LatihanModule } from './latihan/latihan.module.js';
import { AbsensiModule } from './absensi/absensi.module.js';
import { IuranModule } from './iuran/iuran.module.js';
import { PendadaranModule } from './pendadaran/pendadaran.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { DokumenModule } from './dokumen/dokumen.module.js';
import { KontenModule } from './konten/konten.module.js';
import { PustakaModule } from './pustaka/pustaka.module.js';
import { SuratModule } from './surat/surat.module.js';
import { AuditModule } from './audit/audit.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ImportJobsModule } from './import-jobs/import-jobs.module.js';
import { OrganisasiDokumenModule } from './organisasi-dokumen/organisasi-dokumen.module.js';
import { StorageModule } from './storage/storage.module.js';
import { RedisModule } from './redis/redis.module.js';
import { FirebaseModule } from './firebase/firebase.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    StorageModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AnggotaModule,
    ClaimModule,
    OrganisasiModule,
    KegiatanModule,
    LatihanModule,
    AbsensiModule,
    IuranModule,
    PendadaranModule,
    ProfileModule,
    SettingsModule,
    DokumenModule,
    KontenModule,
    PustakaModule,
    SuratModule,
    ImportJobsModule,
    OrganisasiDokumenModule,
    AuditModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: ThrottlerStorage, useClass: RedisThrottlerStorageService },
  ],
})
export class AppModule {}
