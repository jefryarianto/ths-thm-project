"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { HasilPendadaran, PaginatedResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  GraduationCap,
  Award,
  Loader2,
  Search,
  Trash2,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

const columnHelper = createColumnHelper<HasilPendadaran>();

export default function PendadaranPage() {
  const [data, setData] = useState<HasilPendadaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteTarget, setDeleteTarget] = useState<HasilPendadaran | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async (searchTerm?: string, status?: string) => {
    try {
      const res = await api.get<PaginatedResponse<HasilPendadaran>>("/pendadaran/hasil", {
        limit: 50,
        search: searchTerm,
        status: status || undefined,
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
    fetchData(search || undefined, statusFilter || undefined).finally(() => setLoading(false));
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/pendadaran/${deleteTarget.id}`);
      setData((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Data pendadaran berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus data pendadaran");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.calonAnggota?.namaLengkap || "—", {
        id: "calonAnggota",
        header: "Calon Anggota",
        cell: (info) => (
          <span className="flex items-center gap-2 font-medium">
            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("statusKelulusan", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <Badge variant={status === "lulus" ? "default" : status === "gagal" ? "destructive" : "secondary"}>
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("totalSkor", {
        header: "Skor",
        cell: (info) => (
          <span className="font-medium tabular-nums">{info.getValue() ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("ranking", {
        header: "Ranking",
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center gap-1">
              <Award className="h-3 w-3 text-yellow-500" />
              #{info.getValue()}
            </span>
          ) : "—",
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Link href={`/pendadaran/${row.original.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
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
          <h1 className="text-2xl font-bold tracking-tight">Pendadaran</h1>
          <p className="text-sm text-muted-foreground">Kelola ujian dan penilaian pendadaran</p>
        </div>
        <Link href="/pendadaran/create" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pendadaran
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari pendadaran..."
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
            <SelectItem value="lulus">Lulus</SelectItem>
            <SelectItem value="gagal">Gagal</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
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
                        Belum ada data pendadaran
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pendadaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pendadaran ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
