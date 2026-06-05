"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "@/lib/api";
import type { User, Role, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Shield,
  UserCog,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Trash2,
  Eye,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportToCsv, exportToXlsx } from "@/lib/export-utils";
import { toast } from "sonner";

const userColumnHelper = createColumnHelper<User>();
const roleColumnHelper = createColumnHelper<Role>();

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async (searchTerm?: string, isActive?: string, roleId?: string) => {
    const [userRes, roleRes] = await Promise.all([
      api.get<PaginatedResponse<User>>("/users", {
        limit: 50,
        search: searchTerm,
        isActive: isActive || undefined,
        roleId: roleId || undefined,
      }),
      api.get<Role[]>("/roles"),
    ]);
    setUsers(userRes.data);
    setRoles(Array.isArray(roleRes) ? roleRes : []);
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchUsers(search || undefined, statusFilter || undefined, roleFilter || undefined).finally(() => setLoading(false));
  };

  const handleExportCsv = () => {
    exportToCsv(
      users,
      [
        { key: "username", header: "Username" },
        { key: "email", header: "Email", format: (v) => v?.toString() || "" },
        { key: "role", header: "Role", format: (_, row) => row.role?.nama || "" },
        { key: "isActive", header: "Status", format: (v) => v ? "Aktif" : "Nonaktif" },
      ],
      `users-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleExportXlsx = () => {
    exportToXlsx(
      users,
      [
        { key: "username", header: "Username" },
        { key: "email", header: "Email", format: (v) => v?.toString() || "" },
        { key: "role", header: "Role", format: (_, row) => row.role?.nama || "" },
        { key: "isActive", header: "Status", format: (v) => v ? "Aktif" : "Nonaktif" },
      ],
      `users-${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`User ${deleteTarget.username} berhasil dihapus`);
    } catch {
      toast.error("Gagal menghapus user");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const userColumns = useMemo(
    () => [
      userColumnHelper.accessor("username", {
        header: "Username",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      userColumnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue() || "—",
      }),
      userColumnHelper.accessor("role.nama", {
        id: "role",
        header: "Role",
        cell: (info) => <Badge variant="outline">{info.getValue() || "—"}</Badge>,
      }),
      userColumnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "secondary"}>
            {info.getValue() ? "Aktif" : "Nonaktif"}
          </Badge>
        ),
      }),
      userColumnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
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

  const roleColumns = useMemo(
    () => [
      roleColumnHelper.accessor("nama", {
        header: "Nama Role",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      roleColumnHelper.accessor("scope", {
        header: "Scope",
      }),
      roleColumnHelper.accessor("permissions", {
        header: "Permissions",
        cell: (info) => {
          const perms = info.getValue() || [];
          return (
            <div className="flex flex-wrap gap-1">
              {perms.slice(0, 4).map((p, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {p}
                </Badge>
              ))}
              {perms.length > 4 && (
                <span className="text-xs text-muted-foreground">+{perms.length - 4}</span>
              )}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const userTable = useReactTable({
    data: users,
    columns: userColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const roleTable = useReactTable({
    data: roles,
    columns: roleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">Kelola pengguna dan peran sistem</p>
        </div>
        {users.length > 0 && (
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
            placeholder="Cari user..."
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
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>{r.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">Cari</Button>
      </form>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <UserCog className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" /> Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
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
                      {userTable.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                          {hg.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center gap-1">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                  {
                                    asc: <ChevronUp className="h-3 w-3" />,
                                    desc: <ChevronDown className="h-3 w-3" />,
                                  }[header.column.getIsSorted() as string] ?? (
                                    <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                                  )
                                )}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {userTable.getRowModel().rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={userColumns.length} className="text-center text-muted-foreground py-8">
                            Belum ada data user
                          </TableCell>
                        </TableRow>
                      ) : (
                        userTable.getRowModel().rows.map((row) => (
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
                  {userTable.getPageCount() > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        Halaman {userTable.getState().pagination.pageIndex + 1} dari{" "}
                        {userTable.getPageCount()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => userTable.previousPage()}
                          disabled={!userTable.getCanPreviousPage()}
                        >
                          Sebelumnya
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => userTable.nextPage()}
                          disabled={!userTable.getCanNextPage()}
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

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  {roleTable.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {roleTable.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Belum ada data role
                      </TableCell>
                    </TableRow>
                  ) : (
                    roleTable.getRowModel().rows.map((row) => (
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
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{deleteTarget?.username}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
