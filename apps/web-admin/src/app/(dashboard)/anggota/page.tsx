"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { api, type ApiError } from "@/lib/api";
import type { Anggota, Ranting, PaginatedResponse } from "@/lib/types";
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
  Eye,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  UserCheck,
  UserX,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";

const columnHelper = createColumnHelper<Anggota>();

export default function AnggotaPage() {
  const router = useRouter();
  const [data, setData] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rantingFilter, setRantingFilter] = useState("");
  const [rantingList, setRantingList] = useState<Ranting[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Anggota | null>(null);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Fetch ranting list for filter
  useEffect(() => {
    api.get<Ranting[]>("/organisasi/ranting").then((res) => {
      setRantingList(Array.isArray(res) ? res : []);
    }).catch(() => {});
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/anggota/${deleteTarget.id}`);
      toast.success(`Anggota ${deleteTarget.namaLengkap} berhasil dihapus`);
      setData((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus anggota");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selection).map((id) => api.delete(`/anggota/${id}`)));
      toast.success(`${selection.size} anggota berhasil dihapus`);
      setData((prev) => prev.filter((a) => !selection.has(a.id)));
      setSelection(new Set());
      setShowBulkDeleteDialog(false);
    } catch {
      toast.error("Gagal menghapus beberapa anggota");
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
            aria-label={`Pilih ${info.row.original.namaLengkap}`}
          />
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("namaLengkap", {
        header: "Nama",
        cell: (info) => (
          <Link href={`/anggota/${info.row.original.uuid}`} className="font-medium hover:underline">
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("nomorAnggota", {
        header: "Nomor Anggota",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor((row) => row.ranting?.nama || "—", {
        id: "ranting",
        header: "Ranting",
      }),
      columnHelper.accessor("statusKeanggotaan", {
        id: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const isActive = status?.toLowerCase() === "aktif";
          return (
            <Badge variant={isActive ? "default" : "secondary"} className="gap-1">
              {isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
              {status || "N/A"}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => {
          const anggota = info.row.original;
          return (
            <div className="flex justify-end gap-1">
              <Link href={`/anggota/${anggota.uuid}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                <Eye className="h-4 w-4" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(anggota)}
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
      const res = await api.get<PaginatedResponse<Anggota>>("/anggota", {
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        rantingId: rantingFilter || undefined,
      });
      setData(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) router.push("/login");
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
        { key: "namaLengkap", header: "Nama" },
        { key: "nomorAnggota", header: "Nomor Anggota" },
        { key: "ranting", header: "Ranting", format: (_, row) => (row as Anggota).ranting?.nama || "" },
        { key: "statusKeanggotaan", header: "Status" },
        { key: "noHp", header: "No. HP" },
        { key: "email", header: "Email" },
      ],
      `anggota-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      data,
      [
        { key: "namaLengkap", header: "Nama" },
        { key: "nomorAnggota", header: "Nomor Anggota" },
        { key: "ranting", header: "Ranting", format: (_, row) => (row as Anggota).ranting?.nama || "" },
        { key: "statusKeanggotaan", header: "Status" },
        { key: "noHp", header: "No. HP" },
        { key: "email", header: "Email" },
        { key: "tempatLahir", header: "Tempat Lahir" },
        { key: "tanggalLahir", header: "Tanggal Lahir", format: (v) => v ? new Date(v as string).toLocaleDateString("id-ID") : "" },
        { key: "alamat", header: "Alamat" },
      ],
      `anggota-${new Date().toISOString().split("T")[0]}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anggota</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data anggota THS THM
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
          <Link href="/anggota/create" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Link>
        </div>
      </div>

      {selection.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selection.size} anggota dipilih
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
            placeholder="Cari anggota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            <SelectItem value="Alumni">Alumni</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rantingFilter} onValueChange={(v) => setRantingFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Ranting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ranting</SelectItem>
            {rantingList.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>{r.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
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
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Belum ada data anggota
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
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Anggota</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.namaLengkap}</strong>? Tindakan ini tidak dapat dibatalkan.
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
            <DialogTitle>Hapus {selection.size} Anggota</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {selection.size} anggota yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleting}>
              Batal
            </Button>
            <Button variant="destructive" disabled={bulkDeleting} onClick={handleBulkDelete}>
              {bulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selection.size} Anggota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
