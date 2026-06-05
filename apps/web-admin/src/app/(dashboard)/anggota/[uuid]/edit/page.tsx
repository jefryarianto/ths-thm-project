"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { anggotaSchema, type AnggotaFormValues } from "@/lib/schemas";
import type { Anggota } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditAnggotaPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [anggotaId, setAnggotaId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Anggota>(`/anggota/uuid/${uuid}`);
        setAnggotaId(data.id);
        reset({
          namaLengkap: data.namaLengkap,
          nomorAnggota: data.nomorAnggota || "",
          tanggalLahir: data.tanggalLahir ? data.tanggalLahir.split("T")[0] : "",
          jenisKelamin: data.jenisKelamin || "",
          alamat: data.alamat || "",
          rantingId: data.rantingId?.toString() || "",
          statusKeanggotaan: data.statusKeanggotaan || "aktif",
          noHp: data.noHp || "",
          tempatLahir: data.tempatLahir || "",
        });
      } catch {
        router.push("/anggota");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [uuid, reset, router]);

  const onSubmit = async (values: AnggotaFormValues) => {
    if (!anggotaId) {
      toast.error("Data anggota tidak ditemukan");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/anggota/${anggotaId}`, {
        namaLengkap: values.namaLengkap,
        nomorAnggota: values.nomorAnggota || undefined,
        tanggalLahir: values.tanggalLahir || undefined,
        jenisKelamin: values.jenisKelamin || undefined,
        alamat: values.alamat || undefined,
        tempatLahir: values.tempatLahir || undefined,
        noHp: values.noHp || undefined,
        rantingId: values.rantingId ? Number(values.rantingId) : undefined,
        statusKeanggotaan: values.statusKeanggotaan,
      });
      toast.success("Anggota berhasil diperbarui");
      router.push(`/anggota/${uuid}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui anggota");
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
        <Link href={`/anggota/${uuid}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Anggota</h1>
          <p className="text-sm text-muted-foreground">
            Perbarui data anggota
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
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tempat Lahir" error={errors.tempatLahir}>
                  <Input
                    {...register("tempatLahir")}
                    placeholder="Kota tempat lahir"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal Lahir" error={errors.tanggalLahir}>
                  <Input
                    {...register("tanggalLahir")}
                    type="date"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Nomor Anggota" error={errors.nomorAnggota}>
                  <Input
                    {...register("nomorAnggota")}
                    placeholder="Nomor Kartu Tanda Anggota"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Nomor HP" error={errors.noHp}>
                  <Input
                    {...register("noHp")}
                    type="tel"
                    placeholder="08xxxxxx"
                    disabled={saving}
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
                      <SelectValue />
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
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/anggota/${uuid}`} className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
