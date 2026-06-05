"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { IuranStatusResponse, IuranDashboard } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Search, ArrowLeft, Wallet, CalendarDays } from "lucide-react";

const columnHelper = createColumnHelper<IuranStatusResponse["detail"][number]>();

const bulanNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function IuranAnggotaPage() {
  const [anggotaId, setAnggotaId] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState<IuranStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.bulan ?? 0, {
        id: "bulan",
        header: "Bulan",
        cell: (info) => {
          const val = info.getValue();
          return <span className="font-medium">{bulanNames[(val ?? 0)] || "—"}</span>;
        },
      }),
      columnHelper.accessor((row) => row.jenis || row.jenisIuran?.nama || row.metodeBayar || "—", {
        id: "jenis",
        header: "Jenis",
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor((row) => row.jumlah ?? row.jumlahBayar ?? 0, {
        id: "jumlah",
        header: "Jumlah",
        cell: (info) => (
          <span className="font-medium tabular-nums">{formatRupiah(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("tanggalBayar", {
        header: "Tanggal Bayar",
        cell: (info) => {
          const val = info.getValue();
          return val ? (
            <span className="text-muted-foreground">
              {new Date(val).toLocaleDateString("id-ID")}
            </span>
          ) : "—";
        },
      }),
      columnHelper.accessor((row) => row.keterangan || "—", {
        id: "keterangan",
        header: "Keterangan",
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.detail ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  const fetchStatus = async () => {
    if (!anggotaId) return;
    setLoading(true);
    try {
      const res = await api.get<IuranStatusResponse>(`/iuran/status/${anggotaId}`, { tahun });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/iuran" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Status Iuran per Anggota</h1>
          <p className="text-sm text-muted-foreground">
            Lihat riwayat pembayaran iuran per anggota
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ID Anggota"
            value={anggotaId}
            onChange={(e) => setAnggotaId(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="w-24"
        />
        <Button type="submit" variant="secondary" disabled={!anggotaId || loading}>
          {loading ? "Mencari..." : "Cari"}
        </Button>
      </form>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Total Dibayar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatRupiah(data.totalBayar)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Jumlah Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.detail.length} kali</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tahun</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tahun}</div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Bulanan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Belum ada data iuran untuk tahun ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                      Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
