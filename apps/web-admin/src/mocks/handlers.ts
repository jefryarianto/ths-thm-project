import { http, HttpResponse, delay } from "msw";

const BASE = "/api/v1";

const mockNotifications = [
  {
    id: 1,
    judul: "Iuran baru dari Andi Pratama",
    pesan: "Pembayaran iuran bulan Juni 2026 sebesar Rp50.000 telah diterima.",
    isRead: false,
    linkTo: "/iuran",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
  },
  {
    id: 2,
    judul: "Pendadaran dijadwalkan",
    pesan:
      "Jadwal pendadaran untuk Andi Pratama telah ditetapkan pada 15 Juni 2026.",
    isRead: false,
    linkTo: "/pendadaran",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: 3,
    judul: "Kegiatan latihan dibatalkan",
    pesan: "Latihan rutin hari ini dibatalkan karena cuaca buruk.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: 4,
    judul: "Anggota baru mendaftar",
    pesan: "Budi Santoso telah mendaftar sebagai anggota baru.",
    isRead: true,
    linkTo: "/anggota",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 5,
    judul: "Pengumuman organisasi",
    pesan:
      "Rapat organisasi akan diadakan pada hari Sabtu, 10 Juni 2026 pukul 09:00 WIB.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export const handlers = [
  // GET /notifications?limit=5
  http.get(`${BASE}/notifications`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "5");
    return HttpResponse.json({ data: mockNotifications.slice(0, limit) });
  }),

  // GET /notifications/count
  http.get(`${BASE}/notifications/count`, async () => {
    await delay(200);
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
    return HttpResponse.json({ count: unreadCount });
  }),

  // PATCH /notifications/read-all
  http.patch(`${BASE}/notifications/read-all`, async () => {
    await delay(500);
    return HttpResponse.json({});
  }),

  // PATCH /notifications/:id/read
  http.patch(`${BASE}/notifications/:id/read`, async () => {
    await delay(200);
    return HttpResponse.json({});
  }),

  // GET /iuran/dashboard/monthly
  http.get(`${BASE}/iuran/dashboard/monthly`, async () => {
    await delay(200);
    const bulanNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
    const now = new Date();
    const data = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        bulan: `${bulanNames[d.getMonth()]} ${d.getFullYear()}`,
        jumlah: Math.floor(Math.random() * 10000000) + 2000000,
        transaksi: Math.floor(Math.random() * 15) + 3,
      };
    });
    return HttpResponse.json(data);
  }),
];
