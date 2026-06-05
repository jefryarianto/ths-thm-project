"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { pendadaranSchema, type PendadaranFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreatePendadaranPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PendadaranFormValues>({
    resolver: zodResolver(pendadaranSchema) as any,
    defaultValues: {
      kegiatanId: "",
      calonAnggotaId: "",
      statusKelulusan: "",
      totalSkor: undefined,
      ranking: undefined,
    },
  });

  const watchStatus = watch("statusKelulusan");

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      await api.post("/pendadaran/hasil", {
        kegiatanId: Number(values.kegiatanId),
        calonAnggotaId: Number(values.calonAnggotaId),
        statusKelulusan: values.statusKelulusan,
        totalSkor: values.totalSkor ?? undefined,
        ranking: values.ranking ?? undefined,
      });
      toast.success("Data pendadaran berhasil dibuat");
      router.push("/pendadaran");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal membuat data pendadaran");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pendadaran" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Kembali">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Pendadaran</h1>
          <p className="text-sm text-muted-foreground">Buat data ujian pendadaran baru</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Pendadaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormFieldWrapper label="ID Kegiatan" error={undefined} required>
                  <Input
                    {...register("kegiatanId")}
                    type="number"
                    placeholder="ID Kegiatan Pendadaran"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
              <div className="space-y-2">
                <FormFieldWrapper label="ID Calon Anggota" error={undefined} required>
                  <Input
                    {...register("calonAnggotaId")}
                    type="number"
                    placeholder="ID Calon Anggota"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
              <div className="space-y-2">
                <FormFieldWrapper label="Status Kelulusan" error={undefined} required>
                  <Select
                    value={watchStatus}
                    onValueChange={(v) => setValue("statusKelulusan", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lulus">Lulus</SelectItem>
                      <SelectItem value="gagal">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>
              <div className="space-y-2">
                <FormFieldWrapper label="Total Skor" error={undefined}>
                  <Input
                    {...register("totalSkor")}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="0-100"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
              <div className="space-y-2">
                <FormFieldWrapper label="Ranking" error={undefined}>
                  <Input
                    {...register("ranking")}
                    type="number"
                    min={1}
                    placeholder="Peringkat"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/pendadaran" className={buttonVariants({ variant: "outline" })}>Batal</Link>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Pendadaran
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
