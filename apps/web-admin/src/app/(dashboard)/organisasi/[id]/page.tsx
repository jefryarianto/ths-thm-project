"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Nasional, Ranting } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Building2, MapPin, Users, Layers } from "lucide-react";

export default function OrganisasiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [organisasi, setOrganisasi] = useState<Nasional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Nasional>(`/organisasi/${id}`);
        setOrganisasi(data);
      } catch {
        router.push("/organisasi");
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

  if (!organisasi) return null;

  const tingkatColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    nasional: "default",
    distrik: "secondary",
    wilayah: "outline",
    ranting: "outline",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/organisasi" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{organisasi.nama}</h1>
          <p className="text-sm text-muted-foreground">
            Detail organisasi THS THM
          </p>
        </div>
        <Link href={`/organisasi/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Organisasi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informasi Organisasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nama</span>
              <span className="text-sm font-medium">{organisasi.nama}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kode</span>
              <Badge variant="outline">
                <Layers className="mr-1 h-3 w-3" />
                {organisasi.kode || "—"}
              </Badge>
            </div>
            {organisasi.distrik && organisasi.distrik.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jumlah Distrik</span>
                  <span className="text-sm font-medium">{organisasi.distrik.length}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistik */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Statistik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jumlah Distrik</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                {organisasi.distrik?.length ?? "—"} distrik
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
