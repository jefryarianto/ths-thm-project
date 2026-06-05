"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { pustakaSchema, type PustakaFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, BookOpen, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreatePustakaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const onSubmit = async (values: PustakaFormValues) => {
    setLoading(true);
    try {
      await api.post("/pustaka", {
        judul: values.judul,
        jenis: values.jenis,
        deskripsi: values.deskripsi || undefined,
        fileUrl: values.fileUrl || undefined,
        isPublic: values.isPublic,
      });
      toast.success("Pustaka berhasil ditambahkan");
      router.push("/pustaka");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menambahkan pustaka");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pustaka" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Pustaka</h1>
          <p className="text-sm text-muted-foreground">Tambah materi atau dokumen baru</p>
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
                    disabled={loading}
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
                      <SelectValue placeholder="Pilih jenis" />
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
                      disabled={loading}
                    >
                      <Globe className="mr-2 h-4 w-4" /> Publik
                    </Button>
                    <Button
                      type="button"
                      variant={!watchIsPublic ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setValue("isPublic", false)}
                      disabled={loading}
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
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="URL File" error={errors.fileUrl}>
                  <Input
                    {...register("fileUrl")}
                    placeholder="URL / link file (opsional)"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/pustaka" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
