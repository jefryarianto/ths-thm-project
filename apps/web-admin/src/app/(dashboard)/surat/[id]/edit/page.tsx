"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { suratSchema, type SuratFormValues } from "@/lib/schemas";
import type { Surat } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Mail, MailOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditSuratPage() {
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
  } = useForm<SuratFormValues>({
    resolver: zodResolver(suratSchema) as any,
    defaultValues: {
      jenis: "masuk",
      nomorSurat: "",
      pengirim: "",
      tujuan: "",
      perihal: "",
      tanggalSurat: "",
      keterangan: "",
    },
  });

  const watchJenis = watch("jenis");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Surat>(`/surat/${id}`);
        reset({
          jenis: data.pengirim ? "masuk" : "keluar",
          nomorSurat: data.nomorSurat || "",
          pengirim: data.pengirim || "",
          tujuan: data.tujuan || "",
          perihal: data.perihal || "",
          tanggalSurat: data.tanggalSurat ? data.tanggalSurat.split("T")[0] : "",
          keterangan: data.keterangan || "",
        });
      } catch {
        router.push("/surat");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (values: SuratFormValues) => {
    setSaving(true);
    try {
      if (values.jenis === "masuk") {
        await api.put(`/surat/masuk/${id}`, {
          nomorSurat: values.nomorSurat,
          pengirim: values.pengirim || undefined,
          perihal: values.perihal,
          tanggalSurat: values.tanggalSurat,
          keterangan: values.keterangan || undefined,
        });
      } else {
        await api.put(`/surat/keluar/${id}`, {
          nomorSurat: values.nomorSurat,
          perihal: values.perihal,
          penerima: values.tujuan || undefined,
          tanggalSurat: values.tanggalSurat,
          keterangan: values.keterangan || undefined,
        });
      }
      toast.success("Surat berhasil diperbarui");
      router.push("/surat");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui surat");
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
        <Link href="/surat" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Surat</h1>
          <p className="text-sm text-muted-foreground">Perbarui data surat</p>
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
                    disabled={saving}
                  >
                    <Mail className="mr-2 h-4 w-4" /> Surat Masuk
                  </Button>
                  <Button
                    type="button"
                    variant={watchJenis === "keluar" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setValue("jenis", "keluar")}
                    disabled={saving}
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
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              {watchJenis === "masuk" && (
                <div className="space-y-2">
                  <FormFieldWrapper label="Pengirim" error={errors.pengirim}>
                    <Input
                      {...register("pengirim")}
                      placeholder="Nama pengirim / instansi"
                      disabled={saving}
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
                      disabled={saving}
                    />
                  </FormFieldWrapper>
                </div>
              )}

              <div className="space-y-2">
                <FormFieldWrapper label="Perihal" error={errors.perihal} required>
                  <Input
                    {...register("perihal")}
                    placeholder="Perihal surat"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tanggal Surat" error={errors.tanggalSurat} required>
                  <Input
                    {...register("tanggalSurat")}
                    type="date"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Keterangan" error={errors.keterangan}>
                  <Input
                    {...register("keterangan")}
                    placeholder="Keterangan tambahan (opsional)"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/surat" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
