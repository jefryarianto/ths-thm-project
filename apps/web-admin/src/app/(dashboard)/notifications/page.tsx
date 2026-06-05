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
import { api, ApiError } from "@/lib/api";
import type { Notification, PaginatedResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Bell,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  CheckCheck,
  ExternalLink,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Notification>();

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari`;
  const diffWeek = Math.floor(diffDay / 7);
  return `${diffWeek} minggu`;
}

export default function NotificationsPage() {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchData = useCallback(async (searchTerm?: string, isRead?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (isRead && isRead !== "all") params.isRead = isRead;
      const res = await api.get<PaginatedResponse<Notification>>("/notifications", params);
      setData(Array.isArray(res) ? res : res.data);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelection(new Set());
    fetchData(search || undefined, readFilter || undefined);
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all", {});
      setData((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menandai notifikasi");
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    setData((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await api.patch(`/notifications/${id}/read`, {});
    } catch {
      setData((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  };

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selection).map((id) => api.delete(`/notifications/${id}`)));
      toast.success(`${selection.size} notifikasi berhasil dihapus`);
      setData((prev) => prev.filter((n) => !selection.has(n.id)));
      setSelection(new Set());
      setShowBulkDeleteDialog(false);
    } catch {
      toast.error("Gagal menghapus notifikasi");
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
            aria-label="Pilih notifikasi"
          />
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "status",
        header: "",
        cell: (info) =>
          !info.row.original.isRead ? (
            <span className="inline-block h-2 w-2 rounded-full bg-primary" title="Belum dibaca" />
          ) : null,
        enableSorting: false,
      }),
      columnHelper.accessor("title", {
        header: "Judul",
        cell: (info) => (
          <span className={cn("font-medium", !info.row.original.isRead && "text-foreground")}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("body", {
        header: "Pesan",
        cell: (info) => (
          <span className="text-muted-foreground line-clamp-1">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Waktu",
        cell: (info) => (
          <span className="text-muted-foreground whitespace-nowrap text-sm">
            {timeAgo(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "read",
        header: "Status",
        cell: (info) =>
          info.row.original.isRead ? (
            <Badge variant="ghost" className="text-xs">Dibaca</Badge>
          ) : (
            <Badge variant="default" className="text-xs">Baru</Badge>
          ),
      }),
      columnHelper.display({
        id: "link",
        header: "",
        cell: ({ row }) => {
          const linkTarget = row.original.linkTo;
          return linkTarget && linkTarget !== "#" ? (
            <Link
              href={linkTarget}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              onClick={() => {
                if (!row.original.isRead) {
                  handleMarkRead(row.original.id);
                }
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null;
        },
      }),
    ],
    [selection, isAllSelected],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const unreadCount = data.filter((n) => !n.isRead).length;

  const handleExportCsv = () => {
    exportToCsv(
      data,
      [
        { key: "judul", header: "Judul" },
        { key: "pesan", header: "Pesan" },
        { key: "isRead", header: "Status", format: (v) => (v ? "Dibaca" : "Baru") },
        { key: "createdAt", header: "Waktu", format: (v) => new Date(v as string).toLocaleString("id-ID") },
      ],
      `notifications-${new Date().toISOString().split("T")[0]}`,
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      data,
      [
        { key: "judul", header: "Judul" },
        { key: "pesan", header: "Pesan" },
        { key: "isRead", header: "Status", format: (v) => (v ? "Dibaca" : "Baru") },
        { key: "createdAt", header: "Waktu", format: (v) => new Date(v as string).toLocaleString("id-ID") },
      ],
      `notifications-${new Date().toISOString().split("T")[0]}`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Memuat..." : `${data.length} notifikasi (${unreadCount} belum dibaca)`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} disabled={markingAll}>
              {markingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Tandai Semua Dibaca
            </Button>
          )}
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
        </div>
      </div>

      {selection.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selection.size} notifikasi dipilih
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
            placeholder="Cari notifikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={readFilter}
          onValueChange={(v) => {
            setReadFilter(v === "all" ? "" : (v ?? ""));
            setSelection(new Set());
            fetchData(search || undefined, v === "all" ? undefined : v || undefined);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="false">Belum Dibaca</SelectItem>
            <SelectItem value="true">Sudah Dibaca</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">Cari</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
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
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Bell className="h-8 w-8 text-muted-foreground/50" />
                          <p>Tidak ada notifikasi</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className={!row.original.isRead ? "bg-muted/30" : ""}
                      >
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

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {selection.size} Notifikasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {selection.size} notifikasi yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleting}>
              Batal
            </Button>
            <Button variant="destructive" disabled={bulkDeleting} onClick={handleBulkDelete}>
              {bulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selection.size} Notifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


