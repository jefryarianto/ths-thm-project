"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { kegiatanSchema, type KegiatanFormValues } from "@/lib/schemas";
import type { Kegiatan } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Activity } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditKegiatanPage() {
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
  } = useForm<KegiatanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(kegiatanSchema) as any,
    defaultValues: {
      nama: "",
      tipe: "",
      tanggalMulai: "",
      lokasi: "",
      scopeType: "distrik",
      scopeId: "",
    },
  });

  const watchTipe = watch("tipe");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Kegiatan>(`/kegiatan/${id}`);
        reset({
          nama: data.nama,
          tipe: data.tipe,
          tanggalMulai: data.tanggalMulai ? data.tanggalMulai.split("T")[0] : "",
          lokasi: data.lokasi,
          scopeType: data.scopeType || "distrik",
          scopeId: data.scopeId?.toString() || "",
        });
      } catch {
        router.push("/kegiatan");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (values: KegiatanFormValues) => {
    setSaving(true);
    try {
      await api.put(`/kegiatan/${id}`, {
        nama: values.nama,
        tipe: values.tipe,
        tanggalMulai: values.tanggalMulai,
        lokasi: values.lokasi,
        scopeType: values.scopeType,
        scopeId: values.scopeId ? Number(values.scopeId) : undefined,
      });
      toast.success("Kegiatan berhasil diperbarui");
      router.push(`/kegiatan/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui kegiatan");
      }
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/kegiatan/${id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Kegiatan</h1>
          <p className="text-sm text-muted-foreground">Perbarui data kegiatan</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Data Kegiatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nama Kegiatan" error={errors.nama} required>
                  <Input
                    {...register("nama")}
                    placeholder="Nama kegiatan / acara"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tipe Kegiatan" error={errors.tipe} required>
                  <Select
                    value={watchTipe}
                    onValueChange={(v) => setValue("tipe", v ?? "lainnya")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latihan">Latihan</SelectItem>
                      <SelectItem value="pendadaran">Pendadaran</SelectItem>
                      <SelectItem value="ujian_tingkat">Ujian Tingkat</SelectItem>
                      <SelectItem value="rapat">Rapat</SelectItem>
                      <SelectItem value="retret">Retret</SelectItem>
                      <SelectItem value="pelantikan">Pelantikan</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal Mulai" error={errors.tanggalMulai} required>
                  <Input
                    {...register("tanggalMulai")}
                    type="date"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Lokasi" error={errors.lokasi} required>
                  <Input
                    {...register("lokasi")}
                    placeholder="Lokasi kegiatan"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Scope Type" error={errors.scopeType}>
                  <Select
                    value={watch("scopeType")}
                    onValueChange={(v) => setValue("scopeType", v ?? "distrik")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nasional">Nasional</SelectItem>
                      <SelectItem value="distrik">Distrik</SelectItem>
                      <SelectItem value="wilayah">Wilayah</SelectItem>
                      <SelectItem value="ranting">Ranting</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>
              <div className="space-y-2">
                <FormFieldWrapper label="Scope ID" error={errors.scopeId}>
                  <Input
                    {...register("scopeId")}
                    type="number"
                    placeholder="ID organisasi"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/kegiatan/${id}`} className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
