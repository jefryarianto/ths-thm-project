"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { pembayaranIuranSchema, type PembayaranIuranFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const monthNames = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("id-ID", { month: "long" })
);

export default function CreateIuranPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    anggotaId: string;
    jenisIuranId: string;
    jumlahBayar: string;
    metodeBayar: string;
    tanggalBayar: string;
  }>({
    defaultValues: {
      anggotaId: "",
      jenisIuranId: "",
      jumlahBayar: "",
      metodeBayar: "tunai",
      tanggalBayar: new Date().toISOString().split("T")[0],
    },
  });

  const watchMetode = watch("metodeBayar");

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await api.post("/iuran", {
        anggotaId: Number(values.anggotaId),
        jenisIuranId: Number(values.jenisIuranId),
        jumlahBayar: Number(values.jumlahBayar),
        metodeBayar: values.metodeBayar,
        tanggalBayar: values.tanggalBayar || new Date().toISOString(),
      });
      toast.success("Iuran berhasil dicatat");
      router.push("/iuran");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mencatat iuran");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/iuran" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Iuran</h1>
          <p className="text-sm text-muted-foreground">Catat pembayaran iuran anggota</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Iuran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormFieldWrapper label="ID Anggota" error={errors.anggotaId} required>
                <Input
                  {...register("anggotaId")}
                  type="number"
                  placeholder="Masukkan ID anggota"
                  disabled={loading}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormFieldWrapper label="Jenis Iuran ID" error={errors.jenisIuranId} required>
                  <Input
                    {...register("jenisIuranId")}
                    type="number"
                    placeholder="ID Jenis Iuran"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Jumlah (Rp)" error={undefined} required>
                  <Input
                    {...register("jumlahBayar")}
                    type="number"
                    placeholder="50000"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Metode Bayar" error={undefined}>
                  <Select
                    value={watchMetode}
                    onValueChange={(v) => setValue("metodeBayar", v ?? "tunai")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tunai">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal Bayar" error={undefined}>
                  <Input
                    {...register("tanggalBayar")}
                    type="date"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/iuran" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
