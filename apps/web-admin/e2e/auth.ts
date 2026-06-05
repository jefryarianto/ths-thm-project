import { type Page } from "@playwright/test";

// Wildcard pattern: matches any origin (Docker localhost:3000, localhost:4000, or localhost:80 via nginx)
const API_BASE = "**/api/v1";

/**
 * Authenticate for E2E tests:
 * 1. page.context().addCookies() — sets accessToken cookie
 * 2. page.addInitScript() — sets localStorage for client-side AuthContext
 * 3. page.route() — intercepts all API calls with realistic mock responses
 *
 * Call in beforeEach BEFORE any page.goto.
 */
export async function authenticate(page: Page) {
  // Cookie for Next.js middleware (if any)
  await page.context().addCookies([
    {
      name: "accessToken",
      value: "e2e-test-token",
      domain: "localhost",
      path: "/",
    },
  ]);

  // localStorage for client-side AuthContext — runs before React hydrates
  await page.addInitScript(() => {
    localStorage.setItem("accessToken", "e2e-test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 999,
        username: "testuser",
        email: "test@example.com",
        role: "admin",
      }),
    );
  });

  // Intercept all API calls to return realistic mock responses
  await page.route(`${API_BASE}/**`, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // ── Auth endpoints ──
    if (url.includes("/auth/refresh")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "e2e-test-token",
          refreshToken: "e2e-refresh-token",
        }),
      });
      return;
    }

    if (url.includes("/auth/login")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "e2e-test-token",
          refreshToken: "e2e-refresh-token",
          user: { id: 999, username: "testuser", email: "test@example.com", role: "admin" },
        }),
      });
      return;
    }

    if (url.includes("/auth/me") || url.includes("/anggota/me")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 999,
          username: "testuser",
          email: "test@example.com",
          role: "admin",
        }),
      });
      return;
    }

    // ── Dashboard / Stats ──
    if (url.includes("/iuran/dashboard")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalIuran: 45_000_000,
          totalAnggota: 128,
          iuranBulanIni: 3_750_000,
        }),
      });
      return;
    }

    // ── Health ──
    if (url.includes("/health")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ok",
          uptime: 86400,
          services: {
            redis: { status: "connected" },
            database: { status: "connected" },
          },
          system: {
            uptime: 86400,
            memory: { rss: 50_000_000, heapTotal: 30_000_000, heapUsed: 25_000_000, external: 1_000_000 },
            nodeVersion: "v20.11.0",
            platform: "linux",
          },
        }),
      });
      return;
    }

    // ── Audit ──
    if (url.includes("/audit")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { id: 1, action: "CREATE", entityType: "Anggota", entityId: 1, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
            { id: 2, action: "UPDATE", entityType: "Iuran", entityId: 5, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
            { id: 3, action: "DELETE", entityType: "Konten", entityId: 2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: 4, action: "LOGIN", entityType: "User", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
            { id: 5, action: "CREATE", entityType: "Surat", entityId: 12, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
          ],
          meta: { total: 5, page: 1, limit: 8, totalPages: 1 },
        }),
      });
      return;
    }

    // ── Monthly chart data ──
    if (url.includes("/iuran/monthly")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { bulan: 1, tahun: 2026, jumlah: 3_200_000 },
            { bulan: 2, tahun: 2026, jumlah: 3_450_000 },
            { bulan: 3, tahun: 2026, jumlah: 3_100_000 },
            { bulan: 4, tahun: 2026, jumlah: 3_680_000 },
            { bulan: 5, tahun: 2026, jumlah: 3_750_000 },
          ],
          meta: { total: 5, page: 1, limit: 12, totalPages: 1 },
        }),
      });
      return;
    }

    // ── Notifications ──
    if (url.includes("/notifications/count")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 3 }),
      });
      return;
    }

    if (url.includes("/notifications/read-all")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    const notifReadMatch = url.match(/\/notifications\/(\d+)\/read/);
    if (notifReadMatch) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    if (url.includes("/notifications") && method === "GET") {
      const now = new Date().toISOString();
      const hour = 1000 * 60 * 60;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: 1,
              judul: "Iuran baru dari Andi Pratama",
              pesan: "Pembayaran iuran bulan Mei 2026 sebesar Rp 50.000 telah dikonfirmasi.",
              isRead: false,
              linkTo: "/iuran",
              createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            },
            {
              id: 2,
              judul: "Pendadaran dijadwalkan",
              pesan: "Anggota Siti Rahmawati telah dijadwalkan untuk pendadaran pada 15 Juni 2026.",
              isRead: false,
              linkTo: "/pendadaran",
              createdAt: new Date(Date.now() - 2 * hour).toISOString(),
            },
            {
              id: 3,
              judul: "Kegiatan latihan dibatalkan",
              pesan: "Latihan rutin hari Sabtu (28 Mei 2026) dibatalkan karena libur nasional.",
              isRead: false,
              createdAt: new Date(Date.now() - 24 * hour).toISOString(),
            },
            {
              id: 4,
              judul: "Anggota baru terdaftar",
              pesan: "Budi Santoso telah terdaftar sebagai anggota baru di Ranting Cimahi.",
              isRead: true,
              linkTo: "/anggota",
              createdAt: new Date(Date.now() - 3 * 24 * hour).toISOString(),
            },
            {
              id: 5,
              judul: "Surat masuk baru",
              pesan: "Surat dari DPP nomor 045/DPP/V/2026 perihal Undangan Rakernas telah diterima.",
              isRead: true,
              linkTo: "/surat",
              createdAt: new Date(Date.now() - 7 * 24 * hour).toISOString(),
            },
          ],
          meta: { total: 5, page: 1, limit: 10, totalPages: 1 },
        }),
      });
      return;
    }

    // ── Entity list endpoints ──
    // GET /anggota, GET /iuran, GET /latihan, etc.
    if (method === "GET" && urlPathHasApiPrefix(url)) {
      // Return a page-dependent response: page 1 with data, beyond page 1 empty
      const urlObj = new URL(url);
      const page = parseInt(urlObj.searchParams.get("page") || "1", 10);

      if (url.includes("/anggota") && !url.includes("/auth") && !url.includes("me")) {
        if (page <= 1) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: [
                {
                  id: 1,
                  uuid: "uuid-001",
                  nomorAnggota: "001/THS/CML/2026",
                  nama: "Andi Pratama",
                  tempatLahir: "Bandung",
                  tanggalLahir: "1995-03-15",
                  jenisKelamin: "L",
                  alamat: "Jl. Merdeka No. 123, Cimahi",
                  nomorHp: "081234567890",
                  email: "andi@example.com",
                  status: "AKTIF",
                  rantingId: 1,
                  ranting: { id: 1, nama: "Cimahi", tingkat: "RANTING" },
                  level: "KELAK",
                },
                {
                  id: 2,
                  uuid: "uuid-002",
                  nomorAnggota: "002/THS/CML/2026",
                  nama: "Siti Rahmawati",
                  tempatLahir: "Jakarta",
                  tanggalLahir: "1998-07-22",
                  jenisKelamin: "P",
                  alamat: "Jl. Kebon Jeruk No. 45",
                  nomorHp: "081298765432",
                  email: "siti@example.com",
                  status: "AKTIF",
                  rantingId: 1,
                  ranting: { id: 1, nama: "Cimahi", tingkat: "RANTING" },
                  level: "WRG",
                },
              ],
              meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: [], meta: { total: 2, page, limit: 10, totalPages: 1 } }),
          });
        }
        return;
      }

      if (url.includes("/iuran")) {
        if (page <= 1) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: [
                {
                  id: 1,
                  anggotaId: 1,
                  anggota: { id: 1, nama: "Andi Pratama", nomorAnggota: "001/THS/CML/2026" },
                  jenis: "WAJIB",
                  jumlah: 50000,
                  tanggalBayar: "2026-05-01T08:00:00Z",
                  bulan: 5,
                  tahun: 2026,
                  keterangan: "Iuran Mei 2026",
                },
                {
                  id: 2,
                  anggotaId: 2,
                  anggota: { id: 2, nama: "Siti Rahmawati", nomorAnggota: "002/THS/CML/2026" },
                  jenis: "WAJIB",
                  jumlah: 50000,
                  tanggalBayar: "2026-05-02T10:30:00Z",
                  bulan: 5,
                  tahun: 2026,
                },
              ],
              meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: [], meta: { total: 2, page, limit: 10, totalPages: 1 } }),
          });
        }
        return;
      }

      // Generic entity endpoints: return data with page-based pagination
      const entityName = extractEntityName(url);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: page <= 1 ? generateMockEntities(entityName, 3) : [],
          meta: { total: 3, page, limit: 10, totalPages: 1 },
        }),
      });
      return;
    }

    // ── POST / PUT / PATCH / DELETE ──
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: 1, uuid: "mock-uuid-123", success: true }),
      });
      return;
    }

    if (method === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }

    // Fallback
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });
}

// ── Helper functions ──

function urlPathHasApiPrefix(url: string): boolean {
  try {
    return new URL(url).pathname.includes("/api/v1/");
  } catch {
    return false;
  }
}

function extractEntityName(url: string): string {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\/api\/v1\/([^/]+)/);
    return match ? match[1] : "unknown";
  } catch {
    return "unknown";
  }
}

function generateMockEntities(entity: string, count: number): Record<string, unknown>[] {
  const items: Record<string, unknown>[] = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: i,
      uuid: `mock-uuid-${entity}-${i}`,
      nama: `${entity.charAt(0).toUpperCase() + entity.slice(1)} ${i}`,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return items;
}
