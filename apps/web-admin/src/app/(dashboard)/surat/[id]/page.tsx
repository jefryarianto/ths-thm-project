"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Surat } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Mail, MailOpen, Calendar, FileText, Hash } from "lucide-react";

export default function SuratDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [surat, setSurat] = useState<Surat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Surat>(`/surat/${id}`);
        setSurat(data);
      } catch {
        router.push("/surat");
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

  if (!surat) return null;

  const isMasuk = !!surat.pengirim;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/surat" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{surat.perihal}</h1>
          <p className="text-sm text-muted-foreground">
            Detail surat {isMasuk ? "masuk" : "keluar"}
          </p>
        </div>
        <Link href={`/surat/${isMasuk ? 'masuk/' : 'keluar/'}${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi Surat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {isMasuk ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
              Informasi Surat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jenis</span>
              <Badge variant="outline" className="gap-1">
                {isMasuk ? <Mail className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}
                {isMasuk ? "Surat Masuk" : "Surat Keluar"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nomor Surat</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                {surat.nomorSurat}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Perihal</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                {surat.perihal}
              </span>
            </div>
            <Separator />
            {isMasuk ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pengirim</span>
                <span className="text-sm font-medium">{surat.pengirim}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Penerima</span>
                <span className="text-sm font-medium">{surat.pengirim}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Surat</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {new Date(surat.tanggalSurat).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
            {surat.tanggalTerima && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal Terima</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(surat.tanggalTerima).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Keterangan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keterangan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">            {surat.perihal || "Tidak ada keterangan"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
