"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Kegiatan } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Calendar, MapPin, Users, Building2, Activity } from "lucide-react";

export default function KegiatanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Kegiatan>(`/kegiatan/${id}`);
        setKegiatan(data);
      } catch {
        router.push("/kegiatan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!kegiatan) return null;

  const formatTgl = (tgl: string) =>
    new Date(tgl).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/kegiatan" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{kegiatan.nama}</h1>
          <p className="text-sm text-muted-foreground">
            Detail kegiatan dan acara
          </p>
        </div>
        <Link href={`/kegiatan/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Kegiatan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Informasi Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nama Kegiatan</span>
              <span className="text-sm font-medium">{kegiatan.nama}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jenis</span>
              <Badge variant="outline">{kegiatan.tipe}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Mulai</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {formatTgl(kegiatan.tanggalMulai)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lokasi</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {kegiatan.lokasi}
              </span>
            </div>
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scope</span>
                <Badge variant="outline">{kegiatan.scopeType} #{kegiatan.scopeId}</Badge>
              </div>
            </>
          </CardContent>
        </Card>

        {/* Partisipasi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partisipasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Absensi</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                {kegiatan._count?.absensiKegiatan ?? "—"} peserta
              </span>
            </div>
            {kegiatan._count?.latihan !== undefined && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latihan Terkait</span>
                  <span className="text-sm font-medium">
                    {kegiatan._count.latihan} latihan
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
