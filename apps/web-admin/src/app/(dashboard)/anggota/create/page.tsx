"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { anggotaSchema, type AnggotaFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateAnggotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnggotaFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(anggotaSchema) as any,
    defaultValues: {
      namaLengkap: "",
      nomorAnggota: "",
      tanggalLahir: "",
      jenisKelamin: "",
      alamat: "",
      rantingId: "",
      statusKeanggotaan: "aktif",
      noHp: "",
      tempatLahir: "",
    },
  });

  const watchJenisKelamin = watch("jenisKelamin");
  const watchStatus = watch("statusKeanggotaan");

  const onSubmit = async (values: AnggotaFormValues) => {
    setLoading(true);
    try {
      const res = await api.post<{ uuid: string }>("/anggota", {
        ...values,
        rantingId: values.rantingId ? Number(values.rantingId) : undefined,
        nomorAnggota: values.nomorAnggota || undefined,
        tanggalLahir: values.tanggalLahir || undefined,
        tempatLahir: values.tempatLahir || undefined,
        noHp: values.noHp || undefined,
      });
      toast.success("Anggota berhasil ditambahkan");
      router.push(`/anggota/${res.uuid}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menambahkan anggota");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/anggota" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Anggota</h1>
          <p className="text-sm text-muted-foreground">
            Isi data anggota baru
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nama Lengkap" error={errors.namaLengkap} required>
                  <Input
                    {...register("namaLengkap")}
                    placeholder="Nama lengkap anggota"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tempat Lahir" error={errors.tempatLahir}>
                  <Input
                    {...register("tempatLahir")}
                    placeholder="Kota tempat lahir"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal Lahir" error={errors.tanggalLahir}>
                  <Input
                    {...register("tanggalLahir")}
                    type="date"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Nomor Anggota" error={errors.nomorAnggota}>
                  <Input
                    {...register("nomorAnggota")}
                    placeholder="Nomor Kartu Tanda Anggota"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Nomor HP" error={errors.noHp}>
                  <Input
                    {...register("noHp")}
                    type="tel"
                    placeholder="08xxxxxx"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Jenis Kelamin" error={errors.jenisKelamin}>
                  <Select
                    value={watchJenisKelamin}
                    onValueChange={(v) => setValue("jenisKelamin", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Status" error={errors.statusKeanggotaan}>
                  <Select
                    value={watchStatus}
                    onValueChange={(v) => setValue("statusKeanggotaan", v ?? "aktif")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      <SelectItem value="keluar">Keluar</SelectItem>
                      <SelectItem value="meninggal">Meninggal</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Alamat" error={errors.alamat}>
                  <Input
                    {...register("alamat")}
                    placeholder="Alamat lengkap"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/anggota" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
