"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import type { ClaimAnggota, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const columnHelper = createColumnHelper<ClaimAnggota>();

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge variant="default">Disetujui</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Ditolak</Badge>;
  return <Badge variant="secondary">Menunggu</Badge>;
}

export default function ClaimPage() {
  const [data, setData] = useState<ClaimAnggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Approve state
  const [approveTarget, setApproveTarget] = useState<ClaimAnggota | null>(null);
  const [approving, setApproving] = useState(false);

  // Reject state
  const [rejectTarget, setRejectTarget] = useState<ClaimAnggota | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [catatanError, setCatatanError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<ClaimAnggota>>("/claim", {
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setData(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleApprove = useCallback(async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      await api.put(`/claim/${approveTarget.id}/approve`);
      toast.success(`Klaim "${approveTarget.namaLengkap}" berhasil disetujui`);
      setData((prev) =>
        prev.map((d) =>
          d.id === approveTarget.id ? { ...d, status: "approved" } : d
        )
      );
      setApproveTarget(null);
    } catch {
      toast.error("Gagal menyetujui klaim");
    } finally {
      setApproving(false);
    }
  }, [approveTarget]);

  const handleReject = useCallback(async () => {
    if (!rejectTarget) return;
    if (!catatanAdmin.trim()) {
      setCatatanError("Catatan admin wajib diisi");
      return;
    }
    setRejecting(true);
    try {
      await api.put(`/claim/${rejectTarget.id}/reject`, { catatanAdmin });
      toast.success(`Klaim "${rejectTarget.namaLengkap}" berhasil ditolak`);
      setData((prev) =>
        prev.map((d) =>
          d.id === rejectTarget.id ? { ...d, status: "rejected" } : d
        )
      );
      setRejectTarget(null);
      setCatatanAdmin("");
      setCatatanError("");
    } catch {
      toast.error("Gagal menolak klaim");
    } finally {
      setRejecting(false);
    }
  }, [rejectTarget, catatanAdmin]);

  const openRejectDialog = (claim: ClaimAnggota) => {
    setCatatanAdmin("");
    setCatatanError("");
    setRejectTarget(claim);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("namaLengkap", {
        header: "Pemohon",
        cell: (info) => (
          <span className="font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("nomorAnggotaInput", {
        header: "Nomor Anggota Input",
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Tanggal",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => {
          const claim = info.row.original;
          if (claim.status !== "pending") return null;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => setApproveTarget(claim)}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => openRejectDialog(claim)}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </div>
          );
        },
      }),
    ],
    []
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Klaim Keanggotaan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola permintaan klaim keanggotaan dari pengguna
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari pemohon atau nomor anggota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

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
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Belum ada data klaim keanggotaan
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

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Klaim Keanggotaan</DialogTitle>
            <DialogDescription>
              Setujui klaim anggota{" "}
              <strong>{approveTarget?.namaLengkap}</strong> dengan nomor{" "}
              <strong>{approveTarget?.nomorAnggotaInput}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveTarget(null)}
              disabled={approving}
            >
              Batal
            </Button>
            <Button
              variant="default"
              disabled={approving}
              onClick={handleApprove}
            >
              {approving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setCatatanAdmin("");
            setCatatanError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Klaim Keanggotaan</DialogTitle>
            <DialogDescription>
              Tolak klaim anggota{" "}
              <strong>{rejectTarget?.namaLengkap}</strong> dengan nomor{" "}
              <strong>{rejectTarget?.nomorAnggotaInput}</strong>. Berikan
              alasan penolakan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="catatanAdmin">
              Catatan Admin <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="catatanAdmin"
              placeholder="Masukkan alasan penolakan..."
              value={catatanAdmin}
              onChange={(e) => {
                setCatatanAdmin(e.target.value);
                if (e.target.value.trim()) setCatatanError("");
              }}
              rows={4}
              className={catatanError ? "border-destructive" : ""}
            />
            {catatanError && (
              <p className="text-sm text-destructive">{catatanError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setCatatanAdmin("");
                setCatatanError("");
              }}
              disabled={rejecting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={rejecting}
              onClick={handleReject}
            >
              {rejecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
