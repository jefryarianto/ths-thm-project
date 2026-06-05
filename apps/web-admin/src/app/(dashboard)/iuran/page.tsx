"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { PembayaranIuran, PaginatedResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";

const columnHelper = createColumnHelper<PembayaranIuran>();

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function IuranPage() {
  const [data, setData] = useState<PembayaranIuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PembayaranIuran | null>(null);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/iuran/${deleteTarget.id}`);
      toast.success("Iuran berhasil dihapus");
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus iuran");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selection).map((id) => api.delete(`/iuran/${id}`)));
      toast.success(`${selection.size} iuran berhasil dihapus`);
      setData((prev) => prev.filter((d) => !selection.has(d.id)));
      setSelection(new Set());
      setShowBulkDeleteDialog(false);
    } catch {
      toast.error("Gagal menghapus beberapa iuran");
    } finally {
      setBulkDeleting(false);
    }
  }, [selection]);

  const toggleSelection = (id: number) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelection(new Set(data.map((d) => d.id)));
    } else {
      setSelection(new Set());
    }
  };

  const isAllSelected = data.length > 0 && selection.size === data.length;

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={toggleAll}
            aria-label="Pilih semua"
          />
        ),
        cell: (info) => (
          <Checkbox
            checked={selection.has(info.row.original.id)}
            onCheckedChange={() => toggleSelection(info.row.original.id)}
            aria-label={`Pilih iuran`}
          />
        ),
        enableSorting: false,
      }),
      columnHelper.accessor((row) => row.anggota?.namaLengkap || "—", {
        id: "anggota",
        header: "Anggota",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.jenisIuran?.nama || row.metodeBayar || "—", {
        id: "jenisIuran",
        header: "Jenis Iuran",
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("jumlahBayar", {
        header: "Jumlah",
        cell: (info) => (
          <span className="font-medium tabular-nums">{formatRupiah(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor((row) =>
        row.tanggalBayar ? new Date(row.tanggalBayar).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "—",
        { id: "periode", header: "Periode" }
      ),
      columnHelper.accessor("tanggalBayar", {
        header: "Tanggal Bayar",
        cell: (info) => new Date(info.getValue()).toLocaleDateString("id-ID"),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() === 'lunas' ? 'default' : 'secondary'}>{info.getValue()}</Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => {
          const iuran = info.row.original;
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(iuran)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [selection, isAllSelected]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages,
    manualPagination: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<PembayaranIuran>>("/iuran", {
        page,
        limit: 20,
        search: search || undefined,
        status: jenisFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelection(new Set());
    fetchData();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelection(new Set());
    setPage(1);
    fetchData();
  };

  const handleExportCsv = () => {
    exportToCsv(
      data,
      [
        { key: "anggota", header: "Anggota", format: (_, row) => (row as PembayaranIuran).anggota?.namaLengkap || "" },
        { key: "jenis", header: "Jenis", format: (_, row) => (row as PembayaranIuran).jenisIuran?.nama || "" },
        { key: "jumlahBayar", header: "Jumlah", format: (v) => formatRupiah(Number(v)) },
        { key: "tanggalBayar", header: "Tanggal Bayar", format: (v) => new Date(v as string).toLocaleDateString("id-ID") },
        { key: "metodeBayar", header: "Metode" },
        { key: "status", header: "Status" },
      ],
      `iuran-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      data,
      [
        { key: "anggota", header: "Anggota", format: (_, row) => (row as PembayaranIuran).anggota?.namaLengkap || "" },
        { key: "jenis", header: "Jenis", format: (_, row) => (row as PembayaranIuran).jenisIuran?.nama || "" },
        { key: "jumlahBayar", header: "Jumlah", format: (v) => String(Number(v) || 0) },
        { key: "tanggalBayar", header: "Tanggal Bayar", format: (v) => new Date(v as string).toLocaleDateString("id-ID") },
        { key: "metodeBayar", header: "Metode" },
        { key: "status", header: "Status" },
      ],
      `iuran-${new Date().toISOString().split("T")[0]}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Iuran</h1>
          <p className="text-sm text-muted-foreground">
            Kelola iuran anggota
          </p>
        </div>
        <div className="flex gap-2">
          {data.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={handleExportXlsx}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </>
          )}
          <Link href="/iuran/anggota" className={buttonVariants({ variant: "outline" })}>Status per Anggota</Link>
          <Link href="/iuran/create" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Iuran
          </Link>
        </div>
      </div>

      {selection.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selection.size} iuran dipilih
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Terpilih
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelection(new Set())}
          >
            Batal pilih
          </Button>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari iuran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jenisFilter} onValueChange={(v) => setJenisFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="wajib">Wajib</SelectItem>
            <SelectItem value="sukarela">Sukarela</SelectItem>
            <SelectItem value="khusus">Khusus</SelectItem>
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
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="h-3 w-3" />,
                          desc: <ChevronDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() && <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Belum ada data iuran
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Selanjutnya
          </Button>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Iuran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus iuran <strong>{deleteTarget?.jenisIuran?.nama || deleteTarget?.metodeBayar}</strong> sebesar {deleteTarget ? formatRupiah(deleteTarget.jumlahBayar) : ""}? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {selection.size} Iuran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {selection.size} iuran yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleting}>
              Batal
            </Button>
            <Button variant="destructive" disabled={bulkDeleting} onClick={handleBulkDelete}>
              {bulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selection.size} Iuran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
