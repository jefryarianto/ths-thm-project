"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { pendadaranSchema, type PendadaranFormValues } from "@/lib/schemas";
import type { HasilPendadaran } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditPendadaranPage() {
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
  } = useForm<PendadaranFormValues>({
    resolver: zodResolver(pendadaranSchema) as any,
    defaultValues: {
      statusKelulusan: "",
      totalSkor: undefined,
      ranking: undefined,
    },
  });

  const watchStatus = watch("statusKelulusan");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<HasilPendadaran>(`/pendadaran/hasil/${id}`);
        reset({
          statusKelulusan: data.statusKelulusan || "",
          totalSkor: data.totalSkor ?? undefined,
          ranking: data.ranking ?? undefined,
        });
      } catch {
        router.push("/pendadaran");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (values: PendadaranFormValues) => {
    setSaving(true);
    try {
      await api.put(`/pendadaran/hasil/${id}`, {
        statusKelulusan: values.statusKelulusan,
        totalSkor: values.totalSkor ?? undefined,
        ranking: values.ranking ?? undefined,
      });
      toast.success("Data pendadaran berhasil diperbarui");
      router.push("/pendadaran");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui pendadaran");
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
        <Link href="/pendadaran" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Pendadaran</h1>
          <p className="text-sm text-muted-foreground">Perbarui data ujian pendadaran</p>
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
                <FormFieldWrapper label="Status" error={errors.statusKelulusan} required>
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
                <FormFieldWrapper label="Total Skor" error={errors.totalSkor}>
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
                <FormFieldWrapper label="Ranking" error={errors.ranking}>
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
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
