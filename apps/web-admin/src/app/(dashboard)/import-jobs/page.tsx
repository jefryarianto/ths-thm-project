"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { ImportJob, ImportRowLog, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Upload,
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportType = "anggota" | "calon_anggota" | "aspek_penilaian" | "item_penilaian";

const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
  anggota: "Anggota",
  calon_anggota: "Calon Anggota",
  aspek_penilaian: "Aspek Penilaian",
  item_penilaian: "Item Penilaian",
};

// CSV headers per importType
const CSV_HEADERS: Record<ImportType, string[]> = {
  anggota: ["nomorAnggota", "namaLengkap", "jenisKelamin", "rantingId", "tempatLahir", "tanggalLahir", "noHp", "email"],
  calon_anggota: ["namaLengkap", "jenisKelamin", "rantingId", "tempatLahir", "tanggalLahir", "noHp", "email"],
  aspek_penilaian: ["kodeAspek", "namaAspek", "deskripsi", "bobot"],
  item_penilaian: ["aspekId", "kodeItem", "namaItem", "skorMaksimal", "bobot", "urutan"],
};

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<ImportJob>();

// ─── Helper functions ─────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "processing":
      return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Processing</Badge>;
    case "completed":
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Completed</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getRowLogStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
    default:
      return null;
  }
}

function parseCSV(content: string, importType: ImportType): Record<string, string | number>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Record<string, string | number>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    if (values.every((v) => v === "")) continue;

    const row: Record<string, string | number> = {};
    headers.forEach((header, idx) => {
      const val = values[idx] ?? "";
      // Coerce numeric fields
      const numericFields = ["rantingId", "aspekId", "bobot", "skorMaksimal", "urutan"];
      if (numericFields.includes(header) && val !== "") {
        row[header] = Number(val);
      } else {
        row[header] = val;
      }
    });
    rows.push(row);
  }
  return rows;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ImportJobsPage() {
  // List state
  const [data, setData] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Import dialog state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importType, setImportType] = useState<ImportType>("anggota");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail dialog state
  const [detailJob, setDetailJob] = useState<ImportJob | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ─── Fetch list ──────────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        limit: 20,
      };
      if (filterType && filterType !== "all") {
        params.importType = filterType;
      }
      const res = await api.get<PaginatedResponse<ImportJob>>("/import-jobs", params);
      setData(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      toast.error("Gagal memuat data import jobs");
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ─── Detail ──────────────────────────────────────────────────────────────────

  const handleViewDetail = useCallback(async (job: ImportJob) => {
    setDetailJob(job);
    setDetailLoading(true);
    try {
      const detail = await api.get<ImportJob>(`/import-jobs/${job.id}`);
      setDetailJob(detail);
    } catch {
      toast.error("Gagal memuat detail import job");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ─── Import logic ─────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Pilih file CSV terlebih dahulu");
      return;
    }

    setImporting(true);
    try {
      // 1. Create job
      const job = await api.post<ImportJob>("/import-jobs", {
        importType,
        fileName: selectedFile.name,
      });

      // 2. Read & parse CSV
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsText(selectedFile, "UTF-8");
      });

      const rows = parseCSV(content, importType);
      if (rows.length === 0) {
        toast.error("File CSV tidak memiliki data atau format tidak valid");
        setImporting(false);
        return;
      }

      // 3. Process job
      await api.post(`/import-jobs/${job.id}/process`, {
        importType,
        rows,
      });

      toast.success(`Import berhasil diproses — ${rows.length} baris dikirim`);
      setShowImportDialog(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh list
      setPage(1);
      fetchJobs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal melakukan import";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  }, [selectedFile, importType, fetchJobs]);

  const handleCloseImportDialog = useCallback(() => {
    if (importing) return;
    setShowImportDialog(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [importing]);

  // ─── Table columns ────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      columnHelper.accessor("importType", {
        header: "Jenis",
        cell: (info) => (
          <Badge variant="outline">
            {IMPORT_TYPE_LABELS[info.getValue() as ImportType] ?? info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("fileName", {
        header: "File",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate max-w-[200px]" title={info.getValue()}>
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => getStatusBadge(info.getValue()),
      }),
      columnHelper.accessor("totalRows", {
        header: "Total",
        cell: (info) => (
          <span className="tabular-nums font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("successRows", {
        header: "Berhasil",
        cell: (info) => (
          <span className="tabular-nums text-green-600 font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("warningRows", {
        header: "Peringatan",
        cell: (info) => (
          <span className="tabular-nums text-yellow-600 font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("errorRows", {
        header: "Error",
        cell: (info) => (
          <span className="tabular-nums text-destructive font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Tanggal",
        cell: (info) =>
          new Date(info.getValue()).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetail(info.row.original)}
            title="Lihat detail"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [handleViewDetail]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: totalPages,
    manualPagination: true,
  });

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Kelola impor data massal via file CSV
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchJobs} disabled={loading} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowImportDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Import Baru
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select
          value={filterType}
          onValueChange={(v) => {
            setFilterType(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="anggota">Anggota</SelectItem>
            <SelectItem value="calon_anggota">Calon Anggota</SelectItem>
            <SelectItem value="aspek_penilaian">Aspek Penilaian</SelectItem>
            <SelectItem value="item_penilaian">Item Penilaian</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                          (header.column.getCanSort() && (
                            <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                          ))}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    Belum ada import job
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetail(row.original)}
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {/* ── Import Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={showImportDialog} onOpenChange={(open) => { if (!open) handleCloseImportDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Baru</DialogTitle>
            <DialogDescription>
              Pilih jenis data dan unggah file CSV untuk diproses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Import type */}
            <div className="space-y-2">
              <Label htmlFor="import-type">Jenis Data</Label>
              <Select
                value={importType}
                onValueChange={(v) => setImportType(v as ImportType)}
                disabled={importing}
              >
                <SelectTrigger id="import-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anggota">Anggota</SelectItem>
                  <SelectItem value="calon_anggota">Calon Anggota</SelectItem>
                  <SelectItem value="aspek_penilaian">Aspek Penilaian</SelectItem>
                  <SelectItem value="item_penilaian">Item Penilaian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CSV header hint */}
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold">Header CSV yang diharapkan: </span>
              {CSV_HEADERS[importType].join(", ")}
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label htmlFor="csv-file">File CSV</Label>
              <div
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 px-4 py-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => !importing && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                aria-label="Klik untuk memilih file CSV"
              >
                {selectedFile ? (
                  <>
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Klik untuk ganti file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Klik atau seret file CSV ke sini
                    </p>
                    <p className="text-xs text-muted-foreground">Hanya .csv</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileChange}
                disabled={importing}
                aria-label="Upload file CSV"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseImportDialog} disabled={importing}>
              Batal
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile || importing}>
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses…
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Proses Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={detailJob !== null} onOpenChange={(open) => { if (!open) setDetailJob(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detail Import Job</DialogTitle>
            <DialogDescription>
              {detailJob && (
                <span>
                  {IMPORT_TYPE_LABELS[detailJob.importType as ImportType] ?? detailJob.importType}
                  {" — "}
                  {detailJob.fileName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : detailJob ? (
            <div className="flex flex-col gap-4 overflow-hidden">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold tabular-nums">{detailJob.totalRows}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-green-600">Berhasil</p>
                  <p className="text-xl font-bold tabular-nums text-green-600">{detailJob.successRows}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-yellow-600">Peringatan</p>
                  <p className="text-xl font-bold tabular-nums text-yellow-600">{detailJob.warningRows}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-destructive">Error</p>
                  <p className="text-xl font-bold tabular-nums text-destructive">{detailJob.errorRows}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(detailJob.status)}
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(detailJob.createdAt).toLocaleString("id-ID")}
                </span>
              </div>

              {/* Row logs */}
              {detailJob.rowLogs && detailJob.rowLogs.length > 0 && (
                <div className="flex flex-col gap-2 overflow-hidden">
                  <p className="text-sm font-medium">Log Baris ({detailJob.rowLogs.length})</p>
                  <div className="overflow-y-auto rounded-lg border divide-y max-h-72">
                    {detailJob.rowLogs.map((log: ImportRowLog) => (
                      <div key={log.id} className="flex items-start gap-3 px-3 py-2 text-sm">
                        {getRowLogStatusIcon(log.status)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground shrink-0">
                              Baris {log.rowNumber}
                            </span>
                            <Badge
                              variant={
                                log.status === "success"
                                  ? "default"
                                  : log.status === "warning"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {log.status}
                            </Badge>
                          </div>
                          {log.messages && log.messages.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {log.messages.map((msg, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground">
                                  {msg}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!detailJob.rowLogs || detailJob.rowLogs.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Tidak ada log baris tersedia
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailJob(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
