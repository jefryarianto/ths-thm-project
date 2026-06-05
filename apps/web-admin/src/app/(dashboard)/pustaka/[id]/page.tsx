"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Pustaka } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, BookOpen, Globe, Lock, Download, FileText } from "lucide-react";

export default function PustakaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pustaka, setPustaka] = useState<Pustaka | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Pustaka>(`/pustaka/${id}`);
        setPustaka(data);
      } catch {
        router.push("/pustaka");
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

  if (!pustaka) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pustaka" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{pustaka.judul}</h1>
          <p className="text-sm text-muted-foreground">
            Detail pustaka digital
          </p>
        </div>
        <Link href={`/pustaka/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Pustaka */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Informasi Pustaka
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Judul</span>
              <span className="text-sm font-medium text-right max-w-[250px]">{pustaka.judul}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jenis</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {pustaka.jenis}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Visibilitas</span>
              {pustaka.isPublic ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Publik
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Internal
                </Badge>
              )}
            </div>
            {pustaka.deskripsi && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Deskripsi</span>
                  <p className="text-sm font-medium">{pustaka.deskripsi}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* File */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">URL File</span>
              <span className="text-sm font-medium text-right max-w-[250px] truncate">
                {pustaka.fileUrl ? (
                  <a
                    href={pustaka.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {pustaka.fileUrl.split("/").pop() || pustaka.fileUrl}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            {pustaka.fileUrl && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(pustaka.fileUrl, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Buka File
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
