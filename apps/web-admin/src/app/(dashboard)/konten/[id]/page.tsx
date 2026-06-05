"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Konten } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, FileText, Calendar, BookOpen, Eye, EyeOff } from "lucide-react";

export default function KontenDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [konten, setKonten] = useState<Konten | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Konten>(`/konten/${id}`);
        setKonten(data);
      } catch {
        router.push("/konten");
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

  if (!konten) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return { variant: "default" as const, label: "Terbit", icon: <Eye className="h-3 w-3" /> };
      case "draft":
        return { variant: "secondary" as const, label: "Draft", icon: <EyeOff className="h-3 w-3" /> };
      case "archived":
        return { variant: "outline" as const, label: "Arsip", icon: null };
      default:
        return { variant: "secondary" as const, label: status, icon: null };
    }
  };

  const statusBadge = getStatusBadge(konten.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/konten" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{konten.judul}</h1>
          <p className="text-sm text-muted-foreground">
            Detail konten dan publikasi
          </p>
        </div>
        <Link href={`/konten/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Konten */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informasi Konten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Judul</span>
              <span className="text-sm font-medium text-right max-w-[250px]">{konten.judul}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jenis</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                {konten.jenis}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusBadge.variant} className="gap-1">
                {statusBadge.icon}
                {statusBadge.label}
              </Badge>
            </div>
            {konten.publishedAt && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal Terbit</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(konten.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ringkasan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{konten.ringkasan || "Tidak ada ringkasan"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Konten Utama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {konten.konten}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
