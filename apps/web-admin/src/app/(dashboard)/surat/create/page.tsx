"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { suratSchema, type SuratFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, MailOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateSuratPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SuratFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(suratSchema) as any,
    defaultValues: {
      jenis: "masuk",
      nomorSurat: "",
      pengirim: "",
      tujuan: "",
      perihal: "",
      tanggalSurat: new Date().toISOString().split("T")[0],
      keterangan: "",
    },
  });

  const watchJenis = watch("jenis");

  const onSubmit = async (values: SuratFormValues) => {
    setLoading(true);
    try {
      if (values.jenis === "masuk") {
        await api.post("/surat/masuk", {
          nomorSurat: values.nomorSurat,
          pengirim: values.pengirim || undefined,
          perihal: values.perihal,
          tanggalSurat: values.tanggalSurat,
          tanggalTerima: new Date().toISOString(),
          keterangan: values.keterangan || undefined,
        });
      } else {
        await api.post("/surat/keluar", {
          nomorSurat: values.nomorSurat,
          perihal: values.perihal,
          penerima: values.tujuan || undefined,
          tanggalSurat: values.tanggalSurat,
          keterangan: values.keterangan || undefined,
        });
      }
      toast.success("Surat berhasil ditambahkan");
      router.push("/surat");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menambahkan surat");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/surat" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Surat</h1>
          <p className="text-sm text-muted-foreground">Catat surat masuk atau keluar</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormFieldWrapper label="Jenis Surat" error={errors.jenis} required>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={watchJenis === "masuk" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setValue("jenis", "masuk")}
                    disabled={loading}
                  >
                    <Mail className="mr-2 h-4 w-4" /> Surat Masuk
                  </Button>
                  <Button
                    type="button"
                    variant={watchJenis === "keluar" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setValue("jenis", "keluar")}
                    disabled={loading}
                  >
                    <MailOpen className="mr-2 h-4 w-4" /> Surat Keluar
                  </Button>
                </div>
              </FormFieldWrapper>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nomor Surat" error={errors.nomorSurat} required>
                  <Input
                    {...register("nomorSurat")}
                    placeholder="Nomor surat"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              {watchJenis === "masuk" && (
                <div className="space-y-2">
                  <FormFieldWrapper label="Pengirim" error={errors.pengirim}>
                    <Input
                      {...register("pengirim")}
                      placeholder="Nama pengirim / instansi"
                      disabled={loading}
                    />
                  </FormFieldWrapper>
                </div>
              )}

              {watchJenis === "keluar" && (
                <div className="space-y-2">
                  <FormFieldWrapper label="Tujuan" error={errors.tujuan}>
                    <Input
                      {...register("tujuan")}
                      placeholder="Nama tujuan / instansi"
                      disabled={loading}
                    />
                  </FormFieldWrapper>
                </div>
              )}

              <div className="space-y-2">
                <FormFieldWrapper label="Perihal" error={errors.perihal} required>
                  <Input
                    {...register("perihal")}
                    placeholder="Perihal surat"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal Surat" error={errors.tanggalSurat} required>
                  <Input
                    {...register("tanggalSurat")}
                    type="date"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Keterangan" error={errors.keterangan}>
                  <Input
                    {...register("keterangan")}
                    placeholder="Keterangan tambahan (opsional)"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/surat" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
