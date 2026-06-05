"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Latihan, PaginatedResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Dumbbell,
  Search,
  Users,
  Pencil,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const columnHelper = createColumnHelper<Latihan>();

export default function LatihanPage() {
  const [data, setData] = useState<Latihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisMateriFilter, setJenisMateriFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = async (searchTerm?: string, materi?: string, start?: string, end?: string) => {
    try {
      const res = await api.get<PaginatedResponse<Latihan>>("/latihan", {
        limit: 50,
        search: searchTerm,
        jenisMateri: materi || undefined,
        startDate: start || undefined,
        endDate: end || undefined,
      });
      setData(res.data);
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchData(search || undefined, jenisMateriFilter || undefined, startDate || undefined, endDate || undefined).finally(() => setLoading(false));
  };

  const handleExportCsv = () => {
    exportToCsv(
      data,
      [
        { key: "hariTanggal", header: "Tanggal", format: (v) => v ? new Date(v as string).toLocaleDateString("id-ID") : "" },
        { key: "lokasi", header: "Lokasi" },
        { key: "jenisMateri", header: "Materi" },
      ],
      `latihan-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      data,
      [
        { key: "hariTanggal", header: "Tanggal", format: (v) => v ? new Date(v as string).toLocaleDateString("id-ID") : "" },
        { key: "lokasi", header: "Lokasi" },
        { key: "jenisMateri", header: "Materi" },
      ],
      `latihan-${new Date().toISOString().split("T")[0]}`
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("hariTanggal", {
        header: "Tanggal",
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="font-medium">
              {val ? new Date(val).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric",
              }) : "—"}
            </span>
          );
        },
      }),
      columnHelper.accessor("lokasi", {
        header: "Lokasi",
      }),
      columnHelper.accessor("jenisMateri", {
        header: "Materi",
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor((row) => row.jumlahAnggotaHadir ?? 0, {
        id: "jumlahAnggotaHadir",
        header: "Hadir Anggota",
        cell: (info) => (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.jumlahCalonHadir ?? 0, {
        id: "jumlahCalonHadir",
        header: "Hadir Calon",
        cell: (info) => (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Link
              href={`/latihan/${row.original.id}/edit`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
        ),
      }),
      columnHelper.display({
        id: "totalHadir",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold">
            {(row.original.jumlahAnggotaHadir ?? 0) + (row.original.jumlahCalonHadir ?? 0)}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Latihan</h1>
          <p className="text-sm text-muted-foreground">Kelola jadwal dan absensi latihan</p>
        </div>
        {data.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportXlsx}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari latihan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jenisMateriFilter} onValueChange={(v) => setJenisMateriFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Materi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Materi</SelectItem>
            <SelectItem value="Teknik Dasar">Teknik Dasar</SelectItem>
            <SelectItem value="Kata">Kata</SelectItem>
            <SelectItem value="Kombinasi">Kombinasi</SelectItem>
            <SelectItem value="Fisik">Fisik</SelectItem>
            <SelectItem value="Sparring">Sparring</SelectItem>
            <SelectItem value="Senam">Senam</SelectItem>
            <SelectItem value="Teori">Teori</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
          title="Dari tanggal"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
          title="Sampai tanggal"
        />
        <Button type="submit" variant="secondary">Cari</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
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
                            {header.column.getCanSort() &&
                              ({
                                asc: <ChevronUp className="h-3 w-3" />,
                                desc: <ChevronDown className="h-3 w-3" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                              ))}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Dumbbell className="h-8 w-8 text-muted-foreground/60" />
                          Belum ada data latihan
                        </div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
