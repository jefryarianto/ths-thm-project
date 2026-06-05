"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Anggota } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, UserCheck, UserX, Calendar, MapPin, Hash } from "lucide-react";
import Link from "next/link";

export default function AnggotaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Anggota>(`/anggota/uuid/${uuid}`);
        setAnggota(data);
      } catch {
        router.push("/anggota");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uuid]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!anggota) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/anggota" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{anggota.namaLengkap}</h1>
          <p className="text-sm text-muted-foreground">
            Detail anggota THS THM
          </p>
        </div>
        <Link href={`/anggota/${uuid}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Pribadi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {anggota.statusKeanggotaan?.toLowerCase() === "aktif" ? (
                <Badge variant="default" className="gap-1">
                  <UserCheck className="h-3 w-3" /> Aktif
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <UserX className="h-3 w-3" /> {anggota.statusKeanggotaan || "Tidak Aktif"}
                </Badge>
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nomor KTA</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                {anggota.nomorAnggota || "—"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Lahir</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {anggota.tanggalLahir
                  ? new Date(anggota.tanggalLahir).toLocaleDateString("id-ID")
                  : "—"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jenis Kelamin</span>
              <span className="text-sm font-medium">
                {anggota.jenisKelamin === "L" ? "Laki-laki" : anggota.jenisKelamin === "P" ? "Perempuan" : "—"}
              </span>
            </div>
            <Separator />
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Alamat</span>
              <span className="text-sm font-medium text-right max-w-[200px] flex items-start gap-1">
                <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                {anggota.alamat || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Organisasi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organisasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ranting</span>
              <span className="text-sm font-medium">{anggota.ranting?.nama || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
