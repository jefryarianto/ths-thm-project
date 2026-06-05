"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Kegiatan, PaginatedResponse } from "@/lib/types";
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
import { Calendar, MapPin, Users, Download, FileSpreadsheet, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export default function KegiatanPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async (searchTerm?: string, jenis?: string) => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Kegiatan>>("/kegiatan", {
        page,
        limit: 20,
        search: searchTerm || undefined,
        jenis: jenis || undefined,
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
    fetchData(search || undefined, jenisFilter || undefined);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelection(new Set());
    setPage(1);
    fetchData(search || undefined, jenisFilter || undefined);
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
      await Promise.all(Array.from(selection).map((id) => api.delete(`/kegiatan/${id}`)));
      toast.success(`${selection.size} kegiatan berhasil dihapus`);
      setSelection(new Set());
      setDeleteDialogOpen(false);
      fetchData(search || undefined, jenisFilter || undefined);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus kegiatan");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv(data, exportColumns, "export-kegiatan");
  };

  const handleExportXlsx = () => {
    exportToXlsx(data, exportColumns, "export-kegiatan");
  };

  const formatTgl = (tgl: string) =>
    new Date(tgl).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kegiatan</h1>
          <p className="text-sm text-muted-foreground">Kelola kegiatan dan acara</p>
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
            {selection.size} kegiatan dipilih
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
            placeholder="Cari kegiatan..."
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
            <SelectItem value="Pelatihan">Pelatihan</SelectItem>
            <SelectItem value="Seminar">Seminar</SelectItem>
            <SelectItem value="Rapat">Rapat</SelectItem>
            <SelectItem value="Lomba">Lomba</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Belum ada data kegiatan
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

          {/* List */}
          <div className="space-y-3">
            {data.map((k) => (
              <Card
                key={k.id}
                className={`transition-shadow hover:shadow-sm ${
                  selection.has(k.id) ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Checkbox
                    checked={selection.has(k.id)}
                    onCheckedChange={() => toggleItem(k.id)}
                    className="mt-1 shrink-0"
                  />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">{k.nama}</h3>
                      <Badge variant="outline" className="shrink-0">
                        {k.tipe}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatTgl(k.tanggalMulai)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {k.lokasi}
                      </span>
                      {k._count && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {k._count?.absensiKegiatan || 0} hadir
                        </span>
                      )}
                    </p>
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
            <DialogTitle>Hapus {selection.size} kegiatan?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data kegiatan yang dipilih akan dihapus
              secara permanen dari sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleBulkDelete}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus {selection.size} kegiatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const exportColumns: ExportColumn<Kegiatan>[] = [
  { key: "id", header: "ID" },
  { key: "nama", header: "Nama Kegiatan" },
  { key: "tipe", header: "Tipe" },
  {
    key: "tanggalMulai",
    header: "Tanggal Mulai",
    format: (v) =>
      v ? new Date(v as string).toLocaleDateString("id-ID") : "",
  },
  { key: "lokasi", header: "Lokasi" },
];
