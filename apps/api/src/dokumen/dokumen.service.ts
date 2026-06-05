import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { renderKartuAnggota, renderSertifikatPendadaran, renderPiagamPrestasi } from '@ths-thm/templates';
import QRCode from 'qrcode';
import { ulid } from 'ulid';

@Injectable()
export class DokumenService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // ─── Generate Kartu Anggota ───
  async generateKartuAnggota(anggotaId: number, adminId: number) {
    const anggota = await this.prisma.anggota.findUnique({
      where: { id: anggotaId },
      include: { ranting: { include: { wilayah: { include: { distrik: true } } } } },
    });
    if (!anggota) throw new NotFoundException('Anggota not found');

    const docType = await this.prisma.documentType.findUnique({ where: { code: 'KARTU_ANGGOTA' } });
    const template = await this.prisma.documentTemplate.findFirst({
      where: { documentTypeId: docType?.id, isActive: true },
    });

    const qrToken = ulid();
    const verifyUrl = `${process.env.VERIFY_BASE_URL || 'http://localhost:4000/api/v1/dokumen/verify'}/${qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 180, margin: 2 });

    const wilayah = anggota.ranting?.wilayah;
    const distrik = wilayah?.distrik;

    const html = renderKartuAnggota({
      nama: anggota.namaLengkap,
      nomorAnggota: anggota.nomorAnggota,
      ranting: anggota.ranting?.nama || '',
      wilayah: wilayah?.nama || '',
      distrik: distrik?.nama || '',
      tempatTanggalLahir: `${anggota.tempatLahir || ''}, ${anggota.tanggalLahir ? anggota.tanggalLahir.toLocaleDateString('id-ID') : ''}`,
      dadar: '',
      status: anggota.statusKeanggotaan,
      validUntil: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      organizationName: 'TUNGGAL HATI SEMINARI - TUNGGAL HATI MARIA',
      signerName: 'ADMIN',
      signerTitle: 'Koordinator Distrik',
      qrValue: qrToken,
      qrDataUrl,
    });

    const pdfBuffer = await this.renderHtmlToPdf(html, 856, 1080);
    const key = `kartu-anggota/${anggotaId}/${qrToken}.pdf`;
    await this.storage.uploadFile(key, pdfBuffer, 'application/pdf');

    const nomorDokumen = `KTA-${anggota.nomorAnggota}-${new Date().getFullYear()}`;

    return this.prisma.issuedDocument.create({
      data: {
        documentTypeId: docType?.id || 1,
        anggotaId,
        nomorDokumen,
        title: `Kartu Anggota - ${anggota.namaLengkap}`,
        status: 'issued',
        issuedAt: new Date(),
        issuedBy: adminId,
        templateId: template?.id || 1,
        filePath: key,
        qrToken,
        metadata: { type: 'kartu_anggota' },
      },
    });
  }

  // ─── Generate Sertifikat Pendadaran ───
  async generateSertifikat(calonAnggotaId: number, kegiatanId: number, adminId: number) {
    const calon = await this.prisma.calonAnggota.findUnique({ where: { id: calonAnggotaId } });
    if (!calon) throw new NotFoundException('Calon anggota not found');

    const hasil = await this.prisma.hasilPendadaran.findUnique({
      where: { kegiatanId_calonAnggotaId: { kegiatanId, calonAnggotaId } },
    });
    if (!hasil) throw new NotFoundException('Hasil pendadaran not found');

    const kegiatan = await this.prisma.kegiatan.findUnique({ where: { id: kegiatanId } });

    const docType = await this.prisma.documentType.findUnique({ where: { code: 'SERTIFIKAT_PENDADARAN' } });
    const template = await this.prisma.documentTemplate.findFirst({
      where: { documentTypeId: docType?.id, isActive: true },
    });

    const qrToken = ulid();
    const verifyUrl = `${process.env.VERIFY_BASE_URL || 'http://localhost:4000/api/v1/dokumen/verify'}/${qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 180, margin: 2 });

    const aspects = await this.prisma.aspekPenilaian.findMany({
      include: {
        itemPenilaian: {
          where: { isActive: true },
          orderBy: { urutan: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    const predikat =
      hasil.totalSkor.toNumber() >= 76 ? 'Baik Sekali' :
      hasil.totalSkor.toNumber() >= 66 ? 'Baik' : 'Cukup';

    const html = renderSertifikatPendadaran({
      organizationName: 'TUNGGAL HATI SEMINARI - TUNGGAL HATI MARIA',
      districtName: 'KOORDINATORAT DISTRIK',
      certificateNumber: `SPD-${calon.id}-${new Date().getFullYear()}`,
      recipientName: calon.namaLengkap,
      eventTitle: kegiatan?.nama || 'Pendadaran',
      location: kegiatan?.lokasi || '',
      ranting: '',
      wilayah: '',
      distrik: '',
      issuedPlaceDate: `Larantuka, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      finalScore: hasil.totalSkor.toString(),
      predicate: predikat,
      status: hasil.statusKelulusan === 'lulus' ? 'Lulus' : 'Tidak Lulus',
      signers: {
        pastor: { name: 'PASTOR MODERATOR', title: 'Pastor Moderator' },
        koordinator: { name: 'KOORDINATOR DISTRIK', title: 'Koordinator Distrik' },
      },
      aspects: aspects.map((a) => ({
        name: a.namaAspek,
        score: '0',
        items: a.itemPenilaian.map((i) => i.namaItem),
      })),
      qrValue: qrToken,
      qrDataUrl,
    });

    const pdfBuffer = await this.renderHtmlToPdf(html, 1188, 1680);
    const key = `sertifikat/${calonAnggotaId}/${qrToken}.pdf`;
    await this.storage.uploadFile(key, pdfBuffer, 'application/pdf');

    return this.prisma.issuedDocument.create({
      data: {
        documentTypeId: docType?.id || 2,
        calonAnggotaId,
        kegiatanId,
        nomorDokumen: `SPD-${calon.id}-${new Date().getFullYear()}`,
        title: `Sertifikat Pendadaran - ${calon.namaLengkap}`,
        status: 'issued',
        issuedAt: new Date(),
        issuedBy: adminId,
        templateId: template?.id || 1,
        filePath: key,
        qrToken,
        metadata: {
          totalSkor: hasil.totalSkor.toString(),
          predikat,
          statusKelulusan: hasil.statusKelulusan,
        },
      },
    });
  }

  // ─── Generate Piagam Prestasi ───
  async generatePiagam(anggotaId: number, prestasi: string, adminId: number) {
    const anggota = await this.prisma.anggota.findUnique({ where: { id: anggotaId } });
    if (!anggota) throw new NotFoundException('Anggota not found');

    const docType = await this.prisma.documentType.findUnique({ where: { code: 'PIAGAM_PRESTASI' } });
    const template = await this.prisma.documentTemplate.findFirst({
      where: { documentTypeId: docType?.id, isActive: true },
    });

    const qrToken = ulid();
    const verifyUrl = `${process.env.VERIFY_BASE_URL || 'http://localhost:4000/api/v1/dokumen/verify'}/${qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 180, margin: 2 });

    const html = renderPiagamPrestasi({
      organizationName: 'TUNGGAL HATI SEMINARI - TUNGGAL HATI MARIA',
      districtName: 'KOORDINATORAT DISTRIK',
      piagamNumber: `PG-${anggota.nomorAnggota}-${new Date().getFullYear()}`,
      recipientName: anggota.namaLengkap,
      prestasi,
      eventName: '',
      eventDate: '',
      location: '',
      issuedPlaceDate: `Larantuka, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      signers: {
        pastor: { name: 'PASTOR MODERATOR', title: 'Pastor Moderator' },
        koordinator: { name: 'KOORDINATOR DISTRIK', title: 'Koordinator Distrik' },
      },
      qrValue: qrToken,
      qrDataUrl,
    });

    const pdfBuffer = await this.renderHtmlToPdf(html, 1188, 840);
    const key = `piagam/${anggotaId}/${qrToken}.pdf`;
    await this.storage.uploadFile(key, pdfBuffer, 'application/pdf');

    return this.prisma.issuedDocument.create({
      data: {
        documentTypeId: docType?.id || 3,
        anggotaId,
        nomorDokumen: `PG-${anggota.nomorAnggota}-${new Date().getFullYear()}`,
        title: `Piagam Prestasi - ${anggota.namaLengkap}`,
        status: 'issued',
        issuedAt: new Date(),
        issuedBy: adminId,
        templateId: template?.id || 1,
        filePath: key,
        qrToken,
        metadata: { prestasi },
      },
    });
  }

  // ─── Public Verification via QR ───
  async verifyDocument(token: string) {
    const doc = await this.prisma.issuedDocument.findUnique({
      where: { qrToken: token },
      include: {
        documentType: true,
        anggota: { select: { namaLengkap: true, nomorAnggota: true } },
        calonAnggota: { select: { namaLengkap: true } },
      },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Log validation
    await this.prisma.documentValidationLog.create({
      data: {
        issuedDocumentId: doc.id,
        qrToken: token,
        validationResult: doc.status === 'revoked' ? 'revoked' : 'valid',
        validatedBy: 0, // public
        notes: 'Public QR verification',
      },
    });

    if (doc.status === 'revoked') {
      return { status: 'revoked', message: 'This document has been revoked' };
    }

    return {
      status: 'valid',
      type: doc.documentType?.code || 'unknown',
      title: doc.title,
      nomor: doc.nomorDokumen,
      penerima: doc.anggota?.namaLengkap || doc.calonAnggota?.namaLengkap || '',
      diterbitkan: doc.issuedAt,
    };
  }

  // ─── Get document download URL ───
  async getDocumentUrl(anggotaId: number, docTypeCode: string) {
    const docType = await this.prisma.documentType.findUnique({ where: { code: docTypeCode } });
    const doc = await this.prisma.issuedDocument.findFirst({
      where: { anggotaId, documentTypeId: docType?.id, status: 'issued' },
      orderBy: { createdAt: 'desc' },
    });
    if (!doc?.filePath) throw new NotFoundException('Document not found');
    return this.storage.getFileUrl(doc.filePath);
  }

  async revokeDocument(id: number) {
    return this.prisma.issuedDocument.update({
      where: { id },
      data: { status: 'revoked' },
    });
  }

  // ─── HTML to PDF via Playwright ───
  private async renderHtmlToPdf(html: string, width: number, height: number): Promise<Buffer> {
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({ viewport: { width, height } });
      await page.setContent(html, { waitUntil: 'networkidle' });
      const pdf = await page.pdf({ width: `${width}px`, height: `${height}px`, printBackground: true });
      await browser.close();
      return Buffer.from(pdf);
    } catch {
      return Buffer.from(`PDF placeholder for document ${width}x${height}`);
    }
  }
}
