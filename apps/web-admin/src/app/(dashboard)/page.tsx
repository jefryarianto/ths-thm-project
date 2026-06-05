"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { IuranDashboard, Audit, HealthResponse, PaginatedResponse, Latihan, Surat, Konten, Pustaka, Pendadaran, Kegiatan } from "@/lib/types";
import {
  Users,
  Wallet,
  TrendingUp,
  Activity,
  Dumbbell,
  GraduationCap,
  Clock,
  ArrowRight,
  BarChart4,
  RefreshCw,
  CheckCircle2,
  Server,
  Database,
  Building2,
  Mail,
  FileText,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendIndicator, calcTrend, MiniSparkline } from "@/components/ui/trend-indicator";

interface MonthData {
  bulan: string;
  jumlah: number;
  transaksi: number;
}

const bulanNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default function DashboardPage() {
  const [stats, setStats] = useState<IuranDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentActivity, setRecentActivity] = useState<Audit[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [latihanCount, setLatihanCount] = useState<number>(0);
  const [kegiatanCount, setKegiatanCount] = useState<number>(0);
  const [organisasiCount, setOrganisasiCount] = useState<number>(0);
  const [suratCount, setSuratCount] = useState<number>(0);
  const [kontenCount, setKontenCount] = useState<number>(0);
  const [pustakaCount, setPustakaCount] = useState<number>(0);
  const [pendadaranCount, setPendadaranCount] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [iuranTrend, setIuranTrend] = useState<{current: number; previous: number; change: number; chart: number[]} | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsData, auditData, healthData, latihanData, kegiatanData, organisasiData, suratData, kontenData, pustakaData, pendadaranData] = await Promise.all([
          api.get<IuranDashboard>("/iuran/dashboard/stats").catch(() => null),
          api.get<PaginatedResponse<Audit>>("/audit", { limit: 8 }).catch(() => null),
          api.get<HealthResponse>("/health").catch(() => null),
          api.get<PaginatedResponse<Latihan>>("/latihan", { limit: 1 }).catch(() => null),
          api.get<PaginatedResponse<Kegiatan>>("/kegiatan", { limit: 1 }).catch(() => null),
          api.get<PaginatedResponse<any>>("/organisasi/nasional", { limit: 1 }).catch(() => null),
          api.get<PaginatedResponse<Surat>>("/surat", { limit: 1 }).catch(() => null),
          api.get<PaginatedResponse<Konten>>("/konten", { limit: 1 }).catch(() => null),
          api.get<PaginatedResponse<Pustaka>>("/pustaka", { limit: 1 }).catch(() => null),
          api.get<PaginatedResponse<Pendadaran>>("/pendadaran", { limit: 1 }).catch(() => null),
        ]);

        if (statsData) setStats(statsData);
        if (auditData) setRecentActivity(Array.isArray(auditData) ? auditData : auditData.data);
        if (healthData) setHealth(healthData);
        if (latihanData) {
          setLatihanCount(latihanData.meta?.total ?? 0);
        }
        if (kegiatanData) {
          setKegiatanCount(kegiatanData.meta?.total ?? 0);
        }
        if (organisasiData) {
          setOrganisasiCount(organisasiData.meta?.total ?? 0);
        }
        if (suratData) {
          setSuratCount(suratData.meta?.total ?? 0);
        }
        if (kontenData) {
          setKontenCount(kontenData.meta?.total ?? 0);
        }
        if (pustakaData) {
          setPustakaCount(pustakaData.meta?.total ?? 0);
        }
        if (pendadaranData) {
          setPendadaranCount(pendadaranData.meta?.total ?? 0);
        }

        // Fetch monthly iuran chart data (pre-aggregated by backend)
        try {
          const chartData = await api.get<MonthData[]>("/iuran/dashboard/monthly");
          if (chartData) {
            setMonthlyData(chartData);

            // Calculate trends from chart data
            if (chartData.length >= 2) {
              const latest = chartData[chartData.length - 1];
              const prev = chartData[chartData.length - 2];
              const change = calcTrend(latest.jumlah, prev.jumlah);
              setIuranTrend({
                current: latest.jumlah,
                previous: prev.jumlah,
                change,
                chart: chartData.map((d) => d.jumlah),
              });
            } else if (chartData.length === 1) {
              setIuranTrend({
                current: chartData[0].jumlah,
                previous: 0,
                change: 100,
                chart: [chartData[0].jumlah],
              });
            }
          }
        } catch {
          // silent
        }
      } catch {
        setError("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const healthStatusColor = (status?: string) => {
    if (!status) return "text-muted-foreground";
    return status === "online" || status === "connected" || status === "ok"
      ? "text-green-600"
      : "text-red-600";
  };

  const statCards = [
    {
      title: "Total Anggota",
      value: stats?.totalAnggota ?? 0,
      icon: Users,
      description: "Anggota terdaftar",
      href: "/anggota",

    },
    {
      title: "Total Iuran",
      value: stats?.totalIuran ?? 0,
      icon: Wallet,
      description: "Akumulasi iuran",
      href: "/iuran",
      isCurrency: true,
      trend: iuranTrend?.change ?? null,
      trendLabel: "vs bulan lalu",
      sparkline: iuranTrend?.chart,
    },
    {
      title: "Iuran Bulan Ini",
      value: stats?.iuranBulanIni ?? 0,
      icon: TrendingUp,
      description: iuranTrend?.previous
        ? `Bulan lalu: ${formatRupiah(iuranTrend.previous)}`
        : "Transaksi bulan ini",
      href: "/iuran",
      trend: iuranTrend?.change ?? null,
      trendLabel: "vs bulan lalu",
      sparkline: iuranTrend?.chart?.slice(-3),
    },
    {
      title: "Total Latihan",
      value: latihanCount,
      icon: Dumbbell,
      description: "Latihan terselenggara",
      href: "/latihan",
    },
    {
      title: "Aktivitas Sistem",
      value: recentActivity.length,
      icon: Activity,
      description: "Aksi terbaru",
      href: "/audit",
    },
    {
      title: "Kegiatan",
      value: kegiatanCount,
      icon: GraduationCap,
      description: "Kegiatan terselenggara",
      href: "/kegiatan",
    },
    {
      title: "Organisasi",
      value: organisasiCount,
      icon: Building2,
      description: "Unit organisasi",
      href: "/organisasi",
    },
    {
      title: "Surat",
      value: suratCount,
      icon: Mail,
      description: "Surat tercatat",
      href: "/surat",
    },
    {
      title: "Konten",
      value: kontenCount,
      icon: FileText,
      description: "Publikasi & konten",
      href: "/konten",
    },
    {
      title: "Pustaka",
      value: pustakaCount,
      icon: BookOpen,
      description: "Dokumen referensi",
      href: "/pustaka",
    },
    {
      title: "Pendadaran",
      value: pendadaranCount,
      icon: ClipboardCheck,
      description: "Ujian pendadaran",
      href: "/pendadaran",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan data organisasi THS THM
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Memuat...
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className="block group">
            <Card className="transition-all hover:bg-muted/50 hover:shadow-sm cursor-pointer relative overflow-hidden">
              {/* Sparkline background decoration */}
              {card.sparkline && !loading && (
                <div className="absolute right-1 bottom-1 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity">
                  <MiniSparkline data={card.sparkline} />
                </div>
              )}
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {card.isCurrency
                        ? formatRupiah(Number(card.value))
                        : String(card.value)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 min-h-[18px]">
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                      {card.trend !== undefined && card.trend !== null && (
                        <TrendIndicator
                          value={card.trend}
                          label={card.trendLabel}
                          compact
                        />
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Iuran Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              Iuran 6 Bulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : monthlyData.length > 0 ? (
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                      formatter={(value) => [formatRupiah(Number(value)), "Jumlah"]}
                    />
                    <Bar
                      dataKey="jumlah"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <BarChart4 className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Belum ada data iuran</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Aktivitas Terkini
            </CardTitle>
            <Link
              href="/audit"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Lihat semua
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {log.actor?.name || "Sistem"}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {log.action}
                        </Badge>
                        <span>{log.entityName}</span>
                        {log.entityId && (
                          <span className="text-muted-foreground/60">#{log.entityId}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-muted-foreground">{error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Dashboard menampilkan ringkasan data organisasi. Gunakan navigasi sidebar untuk mengelola setiap modul.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary + Health */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Transaction Count */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              Transaksi per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : monthlyData.length > 0 ? (
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                    />
                    <Bar
                      dataKey="transaksi"
                      name="Transaksi"
                      fill="hsl(var(--chart-2, 142.1 76.2% 36.3%))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <BarChart4 className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Belum ada data transaksi</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Server API
                  </span>
                  <span className={`inline-flex items-center gap-1 ${healthStatusColor(health?.status)}`}>
                    <span className={`h-2 w-2 rounded-full ${health?.status === "ok" ? "bg-green-600" : "bg-muted"}`} />
                    {health?.status === "ok" ? "Online" : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database
                  </span>
                  <span className={`inline-flex items-center gap-1 ${healthStatusColor(health?.services?.database?.status)}`}>
                    <span className={`h-2 w-2 rounded-full ${health?.services?.database?.status === "connected" ? "bg-green-600" : "bg-muted"}`} />
                    {health?.services?.database?.status === "connected" ? "Terkoneksi" : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Redis
                  </span>
                  <span className={`inline-flex items-center gap-1 ${healthStatusColor(health?.services?.redis?.status)}`}>
                    <span className={`h-2 w-2 rounded-full ${health?.services?.redis?.status === "connected" ? "bg-green-600" : "bg-muted"}`} />
                    {health?.services?.redis?.status === "connected" ? "Terkoneksi" : "Unknown"}
                  </span>
                </div>
                {health?.system && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Informasi Sistem</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Node:</span>
                          <span>{health.system.nodeVersion}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Platform:</span>
                          <span>{health.system.platform}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Uptime:</span>
                          <span>{Math.floor((health.system.uptime || 0) / 3600)}j</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Memori:</span>
                          <span>{((health.system.memory?.heapUsed || 0) / 1024 / 1024).toFixed(0)} MB</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
