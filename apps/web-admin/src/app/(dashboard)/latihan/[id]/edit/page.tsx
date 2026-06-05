"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { latihanSchema, type LatihanFormValues } from "@/lib/schemas";
import type { Latihan } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function EditLatihanPage() {
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
  } = useForm<LatihanFormValues>({
    resolver: zodResolver(latihanSchema) as any,
    defaultValues: {
      tanggal: "",
      hari: "",
      lokasi: "",
      jenisMateri: "",
      jumlahAnggotaHadir: 0,
      jumlahCalonHadir: 0,
    },
  });

  const watchHari = watch("hari");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Latihan>(`/latihan/${id}`);
        reset({
          tanggal: data.tanggal ? data.tanggal.split("T")[0] : "",
          hari: data.hari || "",
          lokasi: data.lokasi || "",
          jenisMateri: data.jenisMateri || "",
          jumlahAnggotaHadir: data.jumlahAnggotaHadir || 0,
          jumlahCalonHadir: data.jumlahCalonHadir || 0,
        });
      } catch {
        router.push("/latihan");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (values: LatihanFormValues) => {
    setSaving(true);
    try {
      await api.put(`/latihan/${id}`, values);
      toast.success("Latihan berhasil diperbarui");
      router.push("/latihan");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui latihan");
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
        <Link href="/latihan" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Latihan</h1>
          <p className="text-sm text-muted-foreground">Perbarui data latihan</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Latihan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal" error={errors.tanggal} required>
                  <Input
                    {...register("tanggal")}
                    type="date"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Hari" error={errors.hari} required>
                  <Select
                    value={watchHari}
                    onValueChange={(v) => setValue("hari", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hari" />
                    </SelectTrigger>
                    <SelectContent>
                      {hariList.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Lokasi" error={errors.lokasi} required>
                  <Input
                    {...register("lokasi")}
                    placeholder="Lokasi latihan"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Jenis Materi" error={errors.jenisMateri} required>
                  <Input
                    {...register("jenisMateri")}
                    placeholder="Materi latihan"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Hadir Anggota" error={errors.jumlahAnggotaHadir}>
                  <Input
                    {...register("jumlahAnggotaHadir")}
                    type="number"
                    min={0}
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Hadir Calon" error={errors.jumlahCalonHadir}>
                  <Input
                    {...register("jumlahCalonHadir")}
                    type="number"
                    min={0}
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/latihan" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
