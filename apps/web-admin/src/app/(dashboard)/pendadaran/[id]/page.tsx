"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { HasilPendadaran } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, GraduationCap, Award, Star, Trophy } from "lucide-react";

export default function PendadaranDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pendadaran, setPendadaran] = useState<HasilPendadaran | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<HasilPendadaran>(`/pendadaran/hasil/${id}`);
        setPendadaran(data);
      } catch {
        router.push("/pendadaran");
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

  if (!pendadaran) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "lulus": return "default" as const;
      case "gagal": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pendadaran" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Pendadaran {pendadaran.calonAnggota?.namaLengkap ? `- ${pendadaran.calonAnggota.namaLengkap}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detail hasil ujian pendadaran
          </p>
        </div>
        <Link href={`/pendadaran/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Peserta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Informasi Peserta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calon Anggota</span>
              <span className="text-sm font-medium">{pendadaran.calonAnggota?.namaLengkap || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Hasil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Hasil Ujian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={getStatusVariant(pendadaran.statusKelulusan)} className="gap-1">
                {pendadaran.statusKelulusan === "lulus" ? <Award className="h-3 w-3" /> : null}
                {pendadaran.statusKelulusan}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Skor</span>
              <span className="text-lg font-bold flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {pendadaran.totalSkor ?? "—"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ranking</span>
              <span className="text-sm font-medium">#{pendadaran.ranking || "—"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Validasi</span>
              <Badge variant="outline">{pendadaran.statusValidasi}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
