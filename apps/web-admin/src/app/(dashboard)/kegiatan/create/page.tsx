"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { kegiatanSchema, type KegiatanFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateKegiatanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<KegiatanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(kegiatanSchema) as any,
    defaultValues: {
      nama: "",
      tipe: "lainnya",
      tanggalMulai: "",
      lokasi: "",
      scopeType: "distrik",
      scopeId: "",
    },
  });

  const watchTipe = watch("tipe");

  const onSubmit = async (values: KegiatanFormValues) => {
    setLoading(true);
    try {
      await api.post("/kegiatan", {
        nama: values.nama,
        tipe: values.tipe,
        tanggalMulai: values.tanggalMulai,
        lokasi: values.lokasi,
        scopeType: values.scopeType,
        scopeId: values.scopeId ? Number(values.scopeId) : undefined,
      });
      toast.success("Kegiatan berhasil ditambahkan");
      router.push("/kegiatan");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menambahkan kegiatan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kegiatan" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Kegiatan</h1>
          <p className="text-sm text-muted-foreground">Buat kegiatan atau acara baru</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Kegiatan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nama Kegiatan" error={errors.nama} required>
                  <Input
                    {...register("nama")}
                    placeholder="Nama kegiatan / acara"
                    disabled={loading}
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
                      <SelectValue placeholder="Pilih tipe kegiatan" />
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
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Lokasi" error={errors.lokasi} required>
                  <Input
                    {...register("lokasi")}
                    placeholder="Lokasi kegiatan"
                    disabled={loading}
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
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/kegiatan" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
