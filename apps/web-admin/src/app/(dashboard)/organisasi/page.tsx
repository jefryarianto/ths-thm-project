"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Nasional, Distrik, Wilayah, Ranting } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Users, Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function OrganisasiPage() {
  const [nasional, setNasional] = useState<Nasional | null>(null);
  const [distrikList, setDistrikList] = useState<Distrik[]>([]);
  const [selectedDistrik, setSelectedDistrik] = useState<Distrik | null>(null);
  const [wilayahList, setWilayahList] = useState<Wilayah[]>([]);
  const [selectedWilayah, setSelectedWilayah] = useState<Wilayah | null>(null);
  const [rantingList, setRantingList] = useState<Ranting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const [nas, distrik, wilayah, ranting] = await Promise.all([
          api.get<Nasional[]>("/organisasi/nasional"),
          api.get<Distrik[]>("/organisasi/distrik"),
          api.get<Wilayah[]>("/organisasi/wilayah"),
          api.get<Ranting[]>("/organisasi/ranting"),
        ]);
        const nasArr = Array.isArray(nas) ? nas : [nas];
        setNasional(nasArr[0] || null);
        setDistrikList(Array.isArray(distrik) ? distrik : []);
        setWilayahList(Array.isArray(wilayah) ? wilayah : []);
        setRantingList(Array.isArray(ranting) ? ranting : []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const distrik = selectedDistrik || distrikList[0];
  const filteredWilayah = wilayahList.filter((w) => w.distrikId === distrik?.id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Organisasi</h1><p className="text-sm text-muted-foreground">Struktur organisasi THS THM</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisasi</h1>
        <p className="text-sm text-muted-foreground">Struktur organisasi THS THM</p>
      </div>

      {/* Nasional Card */}
      {nasional && (
        <Card className="border-primary/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{nasional.nama}</h3>
                <p className="text-xs text-muted-foreground">Kode: {nasional.kode}</p>
              </div>
            </div>
            <Badge>Nasional</Badge>
          </CardContent>
        </Card>
      )}

      {/* Distrik Cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Distrik</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {distrikList.map((d) => (
            <Card
              key={d.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedDistrik?.id === d.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedDistrik(d)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{d.nama}</p>
                    <p className="text-xs text-muted-foreground">{d.kodeDistrik}</p>
                  </div>
                  <Badge variant="secondary">Distrik</Badge>
                </div>
                {d.alamat && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {d.alamat}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wilayah & Ranting (filtered by selected distrik) */}
      {distrik && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Wilayah */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Wilayah</h3>
            <div className="space-y-2">
              {filteredWilayah.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Belum ada wilayah</p>
              ) : (
                filteredWilayah.map((w) => (
                  <Card
                    key={w.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedWilayah?.id === w.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedWilayah(w)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{w.nama}</p>
                        <p className="text-xs text-muted-foreground">{w.kodeWilayah}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Ranting (filtered by selected wilayah) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ranting</h3>
            <div className="space-y-2">
              {rantingList
                .filter((r) => r.wilayahId === (selectedWilayah?.id || filteredWilayah[0]?.id))
                .map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{r.nama}</p>
                          <p className="text-xs text-muted-foreground">{r.kodeRanting}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">Ranting</Badge>
                      </div>
                      {r.lokasiLatihan && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Dumbbell className="h-3 w-3" /> {r.lokasiLatihan}
                        </p>
                      )}
                      {r._count && (
                        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r._count.anggota} anggota</span>
                          <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> {r._count.latihan} latihan</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              {rantingList.filter((r) => r.wilayahId === (selectedWilayah?.id || filteredWilayah[0]?.id)).length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Belum ada ranting</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
