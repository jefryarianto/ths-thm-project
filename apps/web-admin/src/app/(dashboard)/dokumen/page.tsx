"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IdCard, Award, ScrollText, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function DokumenPage() {
  const [anggotaId, setAnggotaId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleGenerateKartu = async () => {
    if (!anggotaId) { toast.error("Masukkan ID anggota"); return; }
    setLoading("kartu");
    try {
      const res = await api.post<{ fileUrl: string }>(`/dokumen/kartu-anggota/${anggotaId}/generate`);
      toast.success("Kartu anggota berhasil dibuat");
      window.open(res.fileUrl, "_blank");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membuat kartu");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateSertifikat = async () => {
    if (!anggotaId) { toast.error("Masukkan ID anggota"); return; }
    setLoading("sertifikat");
    try {
      const res = await api.post<{ fileUrl: string }>(`/dokumen/sertifikat/${anggotaId}/generate`);
      toast.success("Sertifikat berhasil dibuat");
      window.open(res.fileUrl, "_blank");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membuat sertifikat");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dokumen</h1>
        <p className="text-sm text-muted-foreground">
          Generate dokumen anggota (KTA, sertifikat, piagam)
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">ID Anggota</CardTitle>
          <CardDescription>Masukkan ID numerik anggota untuk generate dokumen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="ID Anggota"
              value={anggotaId}
              onChange={(e) => setAnggotaId(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <IdCard className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">Kartu Anggota</CardTitle>
            <CardDescription>Generate kartu tanda anggota (KTA) untuk anggota THS THM</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateKartu}
              disabled={loading === "kartu"}
              className="w-full"
            >
              {loading === "kartu" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Generate KTA</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <Award className="h-8 w-8 text-yellow-500 mb-2" />
            <CardTitle className="text-base">Sertifikat Pendadaran</CardTitle>
            <CardDescription>Generate sertifikat kelulusan pendadaran</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateSertifikat}
              disabled={loading === "sertifikat"}
              className="w-full"
            >
              {loading === "sertifikat" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Generate Sertifikat</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <ScrollText className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-base">Dokumen Lainnya</CardTitle>
            <CardDescription>Piagam penghargaan dan dokumen resmi lainnya</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Fitur generate piagam dan dokumen lainnya akan tersedia di update selanjutnya.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Segera Hadir
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
