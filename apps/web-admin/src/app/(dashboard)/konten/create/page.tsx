"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { kontenSchema, type KontenFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateKontenPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<KontenFormValues>({
    resolver: zodResolver(kontenSchema) as any,
    defaultValues: {
      judul: "",
      jenis: "",
      konten: "",
      ringkasan: "",
      status: "draft",
    },
  });

  const watchJenis = watch("jenis");
  const watchStatus = watch("status");

  const onSubmit = async (values: KontenFormValues) => {
    setSaving(true);
    try {
      await api.post("/konten", {
        ...values,
        ringkasan: values.ringkasan || undefined,
      });
      toast.success("Konten berhasil dibuat");
      router.push("/konten");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal membuat konten");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/konten" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Kembali">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Konten</h1>
          <p className="text-sm text-muted-foreground">Buat konten publikasi baru</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Data Konten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Judul" error={errors.judul} required>
                  <Input
                    {...register("judul")}
                    placeholder="Judul konten"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Jenis Konten" error={errors.jenis} required>
                  <Select
                    value={watchJenis}
                    onValueChange={(v) => setValue("jenis", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="berita">Berita</SelectItem>
                      <SelectItem value="artikel">Artikel</SelectItem>
                      <SelectItem value="pengumuman">Pengumuman</SelectItem>
                      <SelectItem value="dokumen">Dokumen</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Status" error={errors.status}>
                  <Select
                    value={watchStatus}
                    onValueChange={(v) => setValue("status", v ?? "draft")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Terbit</SelectItem>
                      <SelectItem value="archived">Arsip</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Ringkasan" error={errors.ringkasan}>
                  <Input
                    {...register("ringkasan")}
                    placeholder="Ringkasan singkat (opsional)"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Konten" error={errors.konten} required>
                  <Textarea
                    {...register("konten")}
                    placeholder="Isi konten..."
                    rows={8}
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/konten" className={buttonVariants({ variant: "outline" })}>Batal</Link>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Konten
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
