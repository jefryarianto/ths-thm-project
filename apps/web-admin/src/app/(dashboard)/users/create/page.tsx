"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api, ApiError } from "@/lib/api";
import { type Role } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CreateUserFormValues {
  name: string;
  email: string;
  nomorHp: string;
  password: string;
  roleId: string;
  scopeType: string;
  scopeId: string;
}

const SCOPE_TYPES = [
  { value: "nasional", label: "Nasional" },
  { value: "distrik", label: "Distrik" },
  { value: "wilayah", label: "Wilayah" },
  { value: "ranting", label: "Ranting" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      nomorHp: "",
      password: "",
      roleId: "",
      scopeType: "",
      scopeId: "",
    },
  });

  const watchScopeType = watch("scopeType");
  const watchRoleId = watch("roleId");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.get<Role[]>("/roles");
        setRoles(data);
      } catch {
        toast.error("Gagal memuat daftar role");
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async (values: CreateUserFormValues) => {
    setLoading(true);
    try {
      await api.post("/users", {
        name: values.name,
        email: values.email || undefined,
        nomorHp: values.nomorHp || undefined,
        password: values.password,
        roleId: values.roleId ? Number(values.roleId) : undefined,
        scopeType: values.scopeType || undefined,
        scopeId:
          values.scopeType && values.scopeType !== "nasional" && values.scopeId
            ? Number(values.scopeId)
            : undefined,
      });
      toast.success("User berhasil ditambahkan");
      router.push("/users");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menambahkan user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/users"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah User</h1>
          <p className="text-sm text-muted-foreground">Buat akun user baru</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nama" error={errors.name} required>
                  <Input
                    {...register("name", { required: "Nama wajib diisi" })}
                    placeholder="Nama lengkap user"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <FormFieldWrapper label="Email" error={errors.email} required>
                  <Input
                    {...register("email", {
                      required: "Email wajib diisi",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Format email tidak valid",
                      },
                    })}
                    type="email"
                    placeholder="user@example.com"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              {/* Nomor HP */}
              <div className="space-y-2">
                <FormFieldWrapper label="Nomor HP" error={errors.nomorHp}>
                  <Input
                    {...register("nomorHp")}
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              {/* Password */}
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Password" error={errors.password} required>
                  <Input
                    {...register("password", {
                      required: "Password wajib diisi",
                      minLength: {
                        value: 8,
                        message: "Password minimal 8 karakter",
                      },
                    })}
                    type="password"
                    placeholder="Minimal 8 karakter"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <FormFieldWrapper label="Role" error={errors.roleId}>
                  <Select
                    value={watchRoleId}
                    onValueChange={(v) => setValue("roleId", v ?? "")}
                    disabled={loading || rolesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={rolesLoading ? "Memuat role..." : "Pilih role"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              {/* Scope Type */}
              <div className="space-y-2">
                <FormFieldWrapper label="Tipe Scope" error={errors.scopeType}>
                  <Select
                    value={watchScopeType}
                    onValueChange={(v) => {
                      setValue("scopeType", v ?? "");
                      setValue("scopeId", "");
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPE_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              {/* Scope ID — hanya muncul jika scopeType bukan nasional */}
              {watchScopeType && watchScopeType !== "nasional" && (
                <div className="space-y-2 sm:col-span-2">
                  <FormFieldWrapper label="Scope ID" error={errors.scopeId}>
                    <Input
                      {...register("scopeId")}
                      type="number"
                      placeholder="ID organisasi yang bersangkutan"
                      disabled={loading}
                      min={1}
                    />
                  </FormFieldWrapper>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/users" className={buttonVariants({ variant: "outline" })}>
                Batal
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
