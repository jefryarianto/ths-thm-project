"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import type { Audit, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";

const columnHelper = createColumnHelper<Audit>();

export default function AuditPage() {
  const [data, setData] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "Waktu",
        cell: (info) => (
          <span className="inline-flex items-center gap-1 text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {new Date(info.getValue()).toLocaleString("id-ID")}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.actor?.name || "Sistem", {
        id: "user",
        header: "User",
      }),
      columnHelper.accessor("action", {
        header: "Aksi",
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("entityName", {
        header: "Entitas",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("entityId", {
        header: "ID",
        cell: (info) => (
          <span className="text-muted-foreground tabular-nums">{info.getValue() ?? "—"}</span>
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
    initialState: { pagination: { pageSize: 15 } },
  });

  const buildParams = () => ({
    limit: 50,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  useEffect(() => {
    api.get<PaginatedResponse<Audit>>("/audit", buildParams())
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api.get<PaginatedResponse<Audit>>("/audit", buildParams())
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleExportCsv = () => {
    exportToCsv(
      data,
      [
        { key: "createdAt", header: "Waktu", format: (v) => new Date(v as string).toLocaleString("id-ID") },
        { key: "user", header: "User", format: (_, row) => row.actor?.name || "Sistem" },
        { key: "action", header: "Aksi" },
        { key: "entityName", header: "Entitas" },
        { key: "entityId", header: "ID", format: (v) => v?.toString() || "" },
      ],
      `audit-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      data,
      [
        { key: "createdAt", header: "Waktu", format: (v) => new Date(v as string).toLocaleString("id-ID") },
        { key: "user", header: "User", format: (_, row) => row.actor?.name || "Sistem" },
        { key: "action", header: "Aksi" },
        { key: "entityType", header: "Entitas" },
        { key: "entityId", header: "ID", format: (v) => v?.toString() || "" },
      ],
      `audit-${new Date().toISOString().split("T")[0]}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">Log aktivitas pengguna di sistem</p>
        </div>
        {data.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportXlsx}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari audit..."
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
                      <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                        <div className="flex flex-col items-center gap-2">
                          <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
                          Belum ada data audit
                        </div>
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
    </div>
  );
}
