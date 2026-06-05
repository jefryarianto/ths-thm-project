"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/lib/api";
import { organisasiSchema, type OrganisasiFormValues } from "@/lib/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldWrapper } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateOrganisasiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganisasiFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(organisasiSchema) as any,
    defaultValues: {
      nama: "",
      tingkat: "",
      alamat: "",
    },
  });

  const watchTingkat = watch("tingkat");

  const onSubmit = async (values: OrganisasiFormValues) => {
    setLoading(true);
    try {
      await api.post("/organisasi", {
        nama: values.nama,
        tingkat: values.tingkat,
        alamat: values.alamat || undefined,
      });
      toast.success("Organisasi berhasil ditambahkan");
      router.push("/organisasi");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menambahkan organisasi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/organisasi" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Organisasi</h1>
          <p className="text-sm text-muted-foreground">Tambah organisasi/ranting baru</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Data Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Nama Organisasi" error={errors.nama} required>
                  <Input
                    {...register("nama")}
                    placeholder="Nama organisasi / ranting"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>

              <div className="space-y-2">
                <FormFieldWrapper label="Tingkat" error={errors.tingkat} required>
                  <Select
                    value={watchTingkat}
                    onValueChange={(v) => setValue("tingkat", v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nasional">Nasional</SelectItem>
                      <SelectItem value="provinsi">Provinsi</SelectItem>
                      <SelectItem value="cabang">Cabang</SelectItem>
                      <SelectItem value="ranting">Ranting</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <FormFieldWrapper label="Alamat" error={errors.alamat}>
                  <Input
                    {...register("alamat")}
                    placeholder="Alamat organisasi (opsional)"
                    disabled={loading}
                  />
                </FormFieldWrapper>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/organisasi" className={buttonVariants({ variant: "outline" })}>Batal</Link>
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
