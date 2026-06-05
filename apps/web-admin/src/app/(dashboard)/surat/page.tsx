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
import type { Surat, PaginatedResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Mail,
  MailOpen,
  Pencil,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";

const masukColumnHelper = createColumnHelper<Surat>();
const keluarColumnHelper = createColumnHelper<Surat>();

export default function SuratPage() {
  const [suratMasuk, setSuratMasuk] = useState<Surat[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("masuk");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Surat | null>(null);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const currentData = activeTab === "masuk" ? suratMasuk : suratKeluar;
  const currentSetter = activeTab === "masuk" ? setSuratMasuk : setSuratKeluar;

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const endpoint = activeTab === "masuk" ? `/surat/masuk/${deleteTarget.id}` : `/surat/keluar/${deleteTarget.id}`;
      await api.delete(endpoint);
      toast.success(`Surat ${deleteTarget.nomorSurat} berhasil dihapus`);
      const setter = activeTab === "masuk" ? setSuratMasuk : setSuratKeluar;
      setter((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus surat");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, activeTab]);

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      const endpoint = activeTab === "masuk" ? `/surat/masuk` : `/surat/keluar`;
      await Promise.all(Array.from(selection).map((id) => api.delete(`${endpoint}/${id}`)));
      toast.success(`${selection.size} surat berhasil dihapus`);
      currentSetter((prev) => prev.filter((s) => !selection.has(s.id)));
      setSelection(new Set());
      setShowBulkDeleteDialog(false);
    } catch {
      toast.error("Gagal menghapus beberapa surat");
    } finally {
      setBulkDeleting(false);
    }
  }, [selection, currentSetter]);

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
      setSelection(new Set(currentData.map((d) => d.id)));
    } else {
      setSelection(new Set());
    }
  };

  const isAllSelected = currentData.length > 0 && selection.size === currentData.length;

  const masukColumns = useMemo(
    () => [
      masukColumnHelper.display({
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
            aria-label="Pilih surat"
          />
        ),
        enableSorting: false,
      }),
      masukColumnHelper.accessor("nomorSurat", {
        header: "Nomor Surat",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      masukColumnHelper.accessor("perihal", {
        header: "Perihal",
        cell: (info) => (
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            {info.getValue()}
          </span>
        ),
      }),
      masukColumnHelper.accessor("pengirim", {
        header: "Pengirim",
        cell: (info) => info.getValue() || "—",
      }),
      masukColumnHelper.accessor("tanggalSurat", {
        header: "Tanggal",
        cell: (info) => (
          <span className="text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString("id-ID")}
          </span>
        ),
      }),
      masukColumnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Link
              href={`/surat/${row.original.id}`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [selection, isAllSelected],
  );

  const keluarColumns = useMemo(
    () => [
      keluarColumnHelper.display({
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
            aria-label="Pilih surat"
          />
        ),
        enableSorting: false,
      }),
      keluarColumnHelper.accessor("nomorSurat", {
        header: "Nomor Surat",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      keluarColumnHelper.accessor("perihal", {
        header: "Perihal",
        cell: (info) => (
          <span className="flex items-center gap-2">
            <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            {info.getValue()}
          </span>
        ),
      }),
      keluarColumnHelper.accessor("tujuan", {
        header: "Tujuan",
        cell: (info) => info.getValue() || "—",
      }),
      keluarColumnHelper.accessor("tanggalSurat", {
        header: "Tanggal",
        cell: (info) => (
          <span className="text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString("id-ID")}
          </span>
        ),
      }),
      keluarColumnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Link
              href={`/surat/${row.original.id}`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [selection, isAllSelected],
  );

  const table = useReactTable({
    data: currentData,
    columns: activeTab === "masuk" ? masukColumns : keluarColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const buildParams = () => ({
    limit: 50,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = buildParams();
        const [masukRes, keluarRes] = await Promise.all([
          api.get<PaginatedResponse<Surat>>("/surat/masuk", params),
          api.get<PaginatedResponse<Surat>>("/surat/keluar", params),
        ]);
        setSuratMasuk(Array.isArray(masukRes) ? masukRes : masukRes.data);
        setSuratKeluar(Array.isArray(keluarRes) ? keluarRes : keluarRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelection(new Set());
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const params = buildParams();
        const [masukRes, keluarRes] = await Promise.all([
          api.get<PaginatedResponse<Surat>>("/surat/masuk", params),
          api.get<PaginatedResponse<Surat>>("/surat/keluar", params),
        ]);
        setSuratMasuk(Array.isArray(masukRes) ? masukRes : masukRes.data);
        setSuratKeluar(Array.isArray(keluarRes) ? keluarRes : keluarRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  };

  const handleExportCsv = () => {
    exportToCsv(
      currentData,
      [
        { key: "nomorSurat", header: "Nomor Surat" },
        { key: "perihal", header: "Perihal" },
        ...(activeTab === "masuk"
          ? [{ key: "pengirim" as const, header: "Pengirim", format: (v: unknown) => (v as string) || "" }]
          : [{ key: "tujuan" as const, header: "Tujuan", format: (v: unknown) => (v as string) || "" }]
        ),
        { key: "tanggalSurat", header: "Tanggal", format: (v) => new Date(v as string).toLocaleDateString("id-ID") },
        { key: "keterangan", header: "Keterangan", format: (v) => v?.toString() || "" },
      ],
      `surat-${activeTab}-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      currentData,
      [
        { key: "nomorSurat", header: "Nomor Surat" },
        { key: "perihal", header: "Perihal" },
        ...(activeTab === "masuk"
          ? [{ key: "pengirim" as const, header: "Pengirim", format: (v: unknown) => (v as string) || "" }]
          : [{ key: "tujuan" as const, header: "Tujuan", format: (v: unknown) => (v as string) || "" }]
        ),
        { key: "tanggalSurat", header: "Tanggal", format: (v) => new Date(v as string).toLocaleDateString("id-ID") },
        { key: "keterangan", header: "Keterangan", format: (v) => v?.toString() || "" },
      ],
      `surat-${activeTab}-${new Date().toISOString().split("T")[0]}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Surat</h1>
          <p className="text-sm text-muted-foreground">Kelola surat masuk dan keluar</p>
        </div>
        <div className="flex gap-2">
          {currentData.length > 0 && (
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
          <Link href="/surat/create" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Surat
          </Link>
        </div>
      </div>

      {selection.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selection.size} surat dipilih
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
            placeholder="Cari surat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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

      <Tabs value={activeTab} onValueChange={(v) => { setSelection(new Set()); setActiveTab(v); }}>
        <TabsList>
          <TabsTrigger value="masuk" className="gap-2">
            <Mail className="h-4 w-4" /> Surat Masuk
          </TabsTrigger>
          <TabsTrigger value="keluar" className="gap-2">
            <MailOpen className="h-4 w-4" /> Surat Keluar
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
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
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Belum ada data surat
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
        </TabsContent>
      </Tabs>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Surat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus surat <strong>{deleteTarget?.nomorSurat}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
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
            <DialogTitle>Hapus {selection.size} Surat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {selection.size} surat yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleting}>
              Batal
            </Button>
            <Button variant="destructive" disabled={bulkDeleting} onClick={handleBulkDelete}>
              {bulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selection.size} Surat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
