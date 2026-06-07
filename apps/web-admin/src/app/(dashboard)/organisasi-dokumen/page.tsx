"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { OrganisasiDokumen, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  FileText,
  Globe,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

// ─── Constants ────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS = [
  { value: "statuta", label: "Statuta" },
  { value: "kurikulum", label: "Kurikulum" },
  { value: "struktur_organisasi", label: "Struktur Organisasi" },
  { value: "pedoman", label: "Pedoman" },
  { value: "materi", label: "Materi" },
  { value: "lainnya", label: "Lainnya" },
] as const;

const SCOPE_TYPE_OPTIONS = [
  { value: "nasional", label: "Nasional" },
  { value: "distrik", label: "Distrik" },
  { value: "wilayah", label: "Wilayah" },
  { value: "ranting", label: "Ranting" },
] as const;

type KategoriValue = (typeof KATEGORI_OPTIONS)[number]["value"] | "";

function kategoriLabel(k: string) {
  return KATEGORI_OPTIONS.find((o) => o.value === k)?.label ?? k;
}

function kategoriVariant(k: string): "default" | "secondary" | "outline" | "destructive" {
  const map: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    statuta: "default",
    kurikulum: "secondary",
    struktur_organisasi: "outline",
    pedoman: "secondary",
    materi: "outline",
    lainnya: "outline",
  };
  return map[k] ?? "outline";
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface DokumenFormValues {
  judul: string;
  deskripsi: string;
  kategori: string;
  filePath: string;
  scopeType: string;
  scopeId: string;
  isPublic: boolean;
}

const defaultFormValues: DokumenFormValues = {
  judul: "",
  deskripsi: "",
  kategori: "",
  filePath: "",
  scopeType: "",
  scopeId: "",
  isPublic: true,
};

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<OrganisasiDokumen>();

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrganisasiDokumenPage() {
  const [data, setData] = useState<OrganisasiDokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<KategoriValue>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog state
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<OrganisasiDokumen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganisasiDokumen | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<DokumenFormValues>({ defaultValues: defaultFormValues });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<OrganisasiDokumen>>(
        "/organisasi-dokumen",
        {
          page,
          limit: 20,
          kategori: kategoriFilter || undefined,
        }
      );
      setData(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      toast.error("Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  }, [page, kategoriFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered data (client-side search by judul) ────────────────────────────

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((d) => d.judul.toLowerCase().includes(q));
  }, [data, search]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    form.reset(defaultFormValues);
    setShowFormDialog(true);
  };

  const openEdit = (dok: OrganisasiDokumen) => {
    setEditTarget(dok);
    form.reset({
      judul: dok.judul,
      deskripsi: dok.deskripsi ?? "",
      kategori: dok.kategori,
      filePath: dok.filePath,
      scopeType: dok.scopeType ?? "",
      scopeId: dok.scopeId != null ? String(dok.scopeId) : "",
      isPublic: dok.isPublic,
    });
    setShowFormDialog(true);
  };

  const handleSubmit = async (values: DokumenFormValues) => {
    setSubmitting(true);
    const payload = {
      judul: values.judul,
      deskripsi: values.deskripsi || undefined,
      kategori: values.kategori,
      filePath: values.filePath,
      scopeType: values.scopeType || undefined,
      scopeId: values.scopeId ? Number(values.scopeId) : undefined,
      isPublic: values.isPublic,
    };

    try {
      if (editTarget) {
        const updated = await api.put<OrganisasiDokumen>(
          `/organisasi-dokumen/${editTarget.id}`,
          payload
        );
        setData((prev) =>
          prev.map((d) => (d.id === editTarget.id ? updated : d))
        );
        toast.success("Dokumen berhasil diperbarui");
      } else {
        const created = await api.post<OrganisasiDokumen>(
          "/organisasi-dokumen",
          payload
        );
        setData((prev) => [created, ...prev]);
        toast.success("Dokumen berhasil ditambahkan");
      }
      setShowFormDialog(false);
    } catch {
      toast.error(
        editTarget ? "Gagal memperbarui dokumen" : "Gagal menambahkan dokumen"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/organisasi-dokumen/${deleteTarget.id}`);
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success("Dokumen berhasil dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      columnHelper.accessor("judul", {
        header: "Judul",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("kategori", {
        header: "Kategori",
        cell: (info) => (
          <Badge variant={kategoriVariant(info.getValue())}>
            {kategoriLabel(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor("isPublic", {
        header: "Akses",
        cell: (info) =>
          info.getValue() ? (
            <Badge
              variant="default"
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <Globe className="h-3 w-3" />
              Publik
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Privat
            </Badge>
          ),
      }),
      columnHelper.accessor(
        (row) => row.pengupload?.name ?? `User #${row.uploadedBy}`,
        {
          id: "pengupload",
          header: "Diupload oleh",
          cell: (info) => (
            <span className="text-sm text-muted-foreground">
              {info.getValue()}
            </span>
          ),
        }
      ),
      columnHelper.accessor("createdAt", {
        header: "Tanggal",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Aksi</span>,
        cell: (info) => {
          const dok = info.row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(dok)}
                title="Edit dokumen"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(dok)}
                title="Hapus dokumen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Organisasi Dokumen
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dokumen resmi organisasi
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Dokumen
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari judul dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={kategoriFilter || "all"}
          onValueChange={(v) => {
            setKategoriFilter(v === "all" ? "" : (v as KategoriValue));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {KATEGORI_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Belum ada dokumen
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {/* ── Form Dialog (Tambah / Edit) ─────────────────────────────────────── */}
      <Dialog
        open={showFormDialog}
        onOpenChange={(open) => {
          if (!open) setShowFormDialog(false);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Dokumen" : "Tambah Dokumen"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Perbarui informasi dokumen organisasi."
                : "Isi formulir berikut untuk menambahkan dokumen baru."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Judul */}
              <FormField
                control={form.control}
                name="judul"
                rules={{ required: "Judul wajib diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul *</FormLabel>
                    <FormControl>
                      <Input placeholder="Judul dokumen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deskripsi */}
              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi singkat dokumen (opsional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kategori */}
              <FormField
                control={form.control}
                name="kategori"
                rules={{ required: "Kategori wajib dipilih" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KATEGORI_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Path */}
              <FormField
                control={form.control}
                name="filePath"
                rules={{ required: "File path / URL wajib diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Path / URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://... atau /uploads/dokumen.pdf"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Scope Type & Scope Id — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="scopeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope Type</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? "" : v)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">— Tidak ada —</SelectItem>
                          {SCOPE_TYPE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scopeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ID scope"
                          min={1}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* isPublic */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isPublic"
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel htmlFor="isPublic" className="cursor-pointer">
                        Publik
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Dokumen dapat diakses oleh semua anggota
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFormDialog(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editTarget ? "Simpan Perubahan" : "Tambah Dokumen"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Dokumen</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus dokumen{" "}
              <strong>&ldquo;{deleteTarget?.judul}&rdquo;</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
