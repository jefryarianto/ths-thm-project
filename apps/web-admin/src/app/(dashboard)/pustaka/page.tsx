"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Pustaka, PaginatedResponse } from "@/lib/types";
import { exportToCsv, exportToXlsx, type ExportColumn } from "@/lib/export-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Globe, Lock, Download, FileSpreadsheet, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export default function PustakaPage() {
  const [data, setData] = useState<Pustaka[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [visibilitasFilter, setVisibilitasFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async (searchTerm?: string, jenis?: string, isPublic?: string) => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Pustaka>>("/pustaka", {
        page,
        limit: 20,
        search: searchTerm || undefined,
        jenis: jenis || undefined,
        isPublic: isPublic || undefined,
      });
      setData(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    setSelection(new Set());
    fetchData(search || undefined, jenisFilter || undefined, visibilitasFilter || undefined);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelection(new Set());
    setPage(1);
    fetchData(search || undefined, jenisFilter || undefined, visibilitasFilter || undefined);
  };

  const toggleItem = (id: number) => {
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

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(Array.from(selection).map((id) => api.delete(`/pustaka/${id}`)));
      toast.success(`${selection.size} pustaka berhasil dihapus`);
      setSelection(new Set());
      setDeleteDialogOpen(false);
      fetchData(search || undefined, jenisFilter || undefined, visibilitasFilter || undefined);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus pustaka");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv(data, exportColumns, "export-pustaka");
  };

  const handleExportXlsx = () => {
    exportToXlsx(data, exportColumns, "export-pustaka");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pustaka</h1>
          <p className="text-sm text-muted-foreground">
            Kelola perpustakaan digital dan materi
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportXlsx}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Selection Bar */}
      {selection.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selection.size} pustaka dipilih
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Terpilih
          </Button>
        </div>
      )}

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari pustaka..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jenisFilter} onValueChange={(v) => setJenisFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="Buku">Buku</SelectItem>
            <SelectItem value="Modul">Modul</SelectItem>
            <SelectItem value="Materi">Materi</SelectItem>
            <SelectItem value="Dokumen">Dokumen</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilitasFilter} onValueChange={(v) => setVisibilitasFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Visibilitas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Visibilitas</SelectItem>
            <SelectItem value="true">Publik</SelectItem>
            <SelectItem value="false">Internal</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Belum ada data pustaka
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={toggleAll}
            />
            <span className="text-xs text-muted-foreground">Pilih semua</span>
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <Card
                key={p.id}
                className={`transition-shadow hover:shadow-md ${
                  selection.has(p.id) ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={selection.has(p.id)}
                      onCheckedChange={() => toggleItem(p.id)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                          <h3 className="font-semibold truncate">{p.judul}</h3>
                        </div>
                        {p.isPublic ? (
                          <Globe className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {p.jenis}
                        </Badge>
                        <Badge
                          variant={p.isPublic ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.isPublic ? "Publik" : "Internal"}
                        </Badge>
                      </div>
                      {p.deskripsi && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {p.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {selection.size} pustaka?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data pustaka yang dipilih akan
              dihapus secara permanen dari sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleBulkDelete}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selection.size} pustaka
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const exportColumns: ExportColumn<Pustaka>[] = [
  { key: "id", header: "ID" },
  { key: "judul", header: "Judul" },
  { key: "jenis", header: "Jenis" },
  {
    key: "isPublic",
    header: "Visibilitas",
    format: (v) => (v ? "Publik" : "Internal"),
  },
  { key: "deskripsi", header: "Deskripsi" },
];
