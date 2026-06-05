"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { pustakaSchema, type PustakaFormValues } from "@/lib/schemas";
import type { Pustaka } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, BookOpen, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditPustakaPage() {
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
  } = useForm<PustakaFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pustakaSchema) as any,
    defaultValues: {
      judul: "",
      jenis: "",
      deskripsi: "",
      fileUrl: "",
      isPublic: true,
    },
  });

  const watchJenis = watch("jenis");
  const watchIsPublic = watch("isPublic");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Pustaka>(`/pustaka/${id}`);
        reset({
          judul: data.judul,
          jenis: data.jenis,
          deskripsi: data.deskripsi || "",
          fileUrl: data.fileUrl || "",
          isPublic: data.isPublic,
        });
      } catch {
        router.push("/pustaka");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (values: PustakaFormValues) => {
    setSaving(true);
    try {
      await api.put(`/pustaka/${id}`, {
        judul: values.judul,
        jenis: values.jenis,
        deskripsi: values.deskripsi || undefined,
        fileUrl: values.fileUrl || undefined,
        isPublic: values.isPublic,
      });
      toast.success("Pustaka berhasil diperbarui");
      router.push(`/pustaka/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui pustaka");
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
        <Link href={`/pustaka/${id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Pustaka</h1>
          <p className="text-sm text-muted-foreground">Perbarui data pustaka</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Data Pustaka
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Judul" error={errors.judul} required>
                  <Input
                    {...register("judul")}
                    placeholder="Judul materi / dokumen"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Jenis" error={errors.jenis} required>
                  <Select
                    value={watchJenis}
                    onValueChange={(v) => setValue("jenis", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materi">Materi</SelectItem>
                      <SelectItem value="modul">Modul</SelectItem>
                      <SelectItem value="buku">Buku</SelectItem>
                      <SelectItem value="dokumen">Dokumen</SelectItem>
                      <SelectItem value="referensi">Referensi</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Visibilitas" error={errors.isPublic}>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={watchIsPublic ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setValue("isPublic", true)}
                      disabled={saving}
                    >
                      <Globe className="mr-2 h-4 w-4" /> Publik
                    </Button>
                    <Button
                      type="button"
                      variant={!watchIsPublic ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setValue("isPublic", false)}
                      disabled={saving}
                    >
                      <Lock className="mr-2 h-4 w-4" /> Internal
                    </Button>
                  </div>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Deskripsi" error={errors.deskripsi}>
                  <Input
                    {...register("deskripsi")}
                    placeholder="Deskripsi singkat (opsional)"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="URL File" error={errors.fileUrl}>
                  <Input
                    {...register("fileUrl")}
                    placeholder="URL / link file (opsional)"
                    disabled={saving}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/pustaka/${id}`} className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
