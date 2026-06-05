"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Latihan } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Calendar, MapPin, Dumbbell, Users, BookOpen } from "lucide-react";

export default function LatihanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [latihan, setLatihan] = useState<Latihan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Latihan>(`/latihan/${id}`);
        setLatihan(data);
      } catch {
        router.push("/latihan");
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

  if (!latihan) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/latihan" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Latihan {latihan.hari || ""}, {latihan.tanggal ? new Date(latihan.tanggal).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric",
            }) : "—"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detail sesi latihan
          </p>
        </div>
        <Link href={`/latihan/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Latihan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Informasi Latihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hari</span>
              <span className="text-sm font-medium">{latihan.hari || "—"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tanggal</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {latihan.tanggal ? new Date(latihan.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                }) : "—"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lokasi</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {latihan.lokasi}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jenis Materi</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline">{latihan.jenisMateri}</Badge>
              </span>
            </div>
            {latihan.ranting && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ranting</span>
                  <span className="text-sm font-medium">{latihan.ranting.nama}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Kehadiran */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Anggota Hadir</span>
              <span className="text-sm font-medium">{(latihan.jumlahAnggotaHadir ?? 0)} orang</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calon Hadir</span>
              <span className="text-sm font-medium">{(latihan.jumlahCalonHadir ?? 0)} orang</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Hadir</span>
              <span className="text-base font-bold">
                {(latihan.jumlahAnggotaHadir ?? 0) + (latihan.jumlahCalonHadir ?? 0)} orang
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
