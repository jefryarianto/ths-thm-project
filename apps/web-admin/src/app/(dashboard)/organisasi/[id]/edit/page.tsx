"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { organisasiSchema, type OrganisasiFormValues } from "@/lib/schemas";
import type { Nasional } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditOrganisasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrganisasiFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(organisasiSchema) as any,
    defaultValues: {
      nama: "",
      tingkat: "",
      alamat: "",
    },
  });

  const watchTingkat = watch("tingkat");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Nasional>(`/organisasi/${id}`);
        reset({
          nama: data.nama,
          tingkat: data.kode || "",
          alamat: "",
        });
      } catch {
        router.push("/organisasi");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (values: OrganisasiFormValues) => {
    setSaving(true);
    try {
      await api.put(`/organisasi/${id}`, {
        nama: values.nama,
        kode: values.tingkat,
      });
      toast.success("Organisasi berhasil diperbarui");
      router.push(`/organisasi/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui organisasi");
      }
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/organisasi/${id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Organisasi</h1>
          <p className="text-sm text-muted-foreground">Perbarui data organisasi</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Data Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nama Organisasi" error={errors.nama} required>
                  <Input
                    {...register("nama")}
                    placeholder="Nama organisasi / ranting"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tingkat" error={errors.tingkat} required>
                  <Select
                    value={watchTingkat}
                    onValueChange={(v) => setValue("tingkat", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nasional">Nasional</SelectItem>
                      <SelectItem value="provinsi">Provinsi</SelectItem>
                      <SelectItem value="cabang">Cabang</SelectItem>
                      <SelectItem value="ranting">Ranting</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Alamat" error={errors.alamat}>
                  <Input
                    {...register("alamat")}
                    placeholder="Alamat organisasi (opsional)"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/organisasi/${id}`} className={buttonVariants({ variant: "outline" })}>Batal</Link>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
