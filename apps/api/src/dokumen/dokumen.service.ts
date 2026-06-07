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

  // ─── Document Types ───────────────────────────────────────────────────────────

  async createDocumentType(data: {
    code: string;
    name: string;
    category: string;
    isAutoGenerated?: boolean;
    requiresApproval?: boolean;
  }) {
    return this.prisma.documentType.create({ data });
  }

  async findAllDocumentTypes() {
    return this.prisma.documentType.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { documentTemplates: true, issuedDocuments: true } },
      },
    });
  }

  async findDocumentTypeById(id: number) {
    const type = await this.prisma.documentType.findUnique({
      where: { id },
      include: {
        documentTemplates: { where: { isActive: true } },
        documentSigners: { where: { isActive: true } },
        documentStamps: { where: { isActive: true } },
      },
    });
    if (!type) throw new NotFoundException(`Document type #${id} tidak ditemukan`);
    return type;
  }

  async updateDocumentType(id: number, data: Partial<{
    name: string;
    category: string;
    isAutoGenerated: boolean;
    requiresApproval: boolean;
    isActive: boolean;
  }>) {
    const type = await this.prisma.documentType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException(`Document type #${id} tidak ditemukan`);
    return this.prisma.documentType.update({ where: { id }, data });
  }

  async deleteDocumentType(id: number) {
    const type = await this.prisma.documentType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException(`Document type #${id} tidak ditemukan`);
    // Soft delete via isActive
    return this.prisma.documentType.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Document Templates ───────────────────────────────────────────────────────

  async createDocumentTemplate(
    file: Express.Multer.File,
    data: {
      documentTypeId: number;
      name: string;
      layoutJson?: Record<string, unknown>;
      scopeType?: string;
      scopeId?: number;
    },
    createdBy: number,
  ) {
    const ext = file.originalname.split('.').pop();
    const key = `document-templates/${data.documentTypeId}/${Date.now()}.${ext}`;
    await this.storage.uploadFile(key, file.buffer, file.mimetype);

    return this.prisma.documentTemplate.create({
      data: {
        documentTypeId: data.documentTypeId,
        name: data.name,
        templateFilePath: key,
        layoutJson: (data.layoutJson ?? null) as any,
        scopeType: data.scopeType ?? null,
        scopeId: data.scopeId ?? null,
        createdBy,
      },
      include: { documentType: true, pembuat: { select: { id: true, name: true } } },
    });
  }

  async findAllDocumentTemplates(documentTypeId?: number) {
    const where: any = {};
    if (documentTypeId) where.documentTypeId = documentTypeId;
    return this.prisma.documentTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { documentType: true, pembuat: { select: { id: true, name: true } } },
    });
  }

  async findDocumentTemplateById(id: number) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
      include: { documentType: true, pembuat: { select: { id: true, name: true } } },
    });
    if (!template) throw new NotFoundException(`Template #${id} tidak ditemukan`);
    const fileUrl = await this.storage.getFileUrl(template.templateFilePath);
    return { ...template, fileUrl };
  }

  async updateDocumentTemplate(id: number, data: Partial<{
    name: string;
    layoutJson: Record<string, unknown>;
    isActive: boolean;
    scopeType: string;
    scopeId: number;
  }>) {
    const template = await this.prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException(`Template #${id} tidak ditemukan`);
    return this.prisma.documentTemplate.update({ where: { id }, data: data as any });
  }

  async deleteDocumentTemplate(id: number) {
    const template = await this.prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException(`Template #${id} tidak ditemukan`);
    await this.storage.deleteFile(template.templateFilePath);
    await this.prisma.documentTemplate.delete({ where: { id } });
    return { message: 'Template berhasil dihapus' };
  }

  // ─── Document Signers ─────────────────────────────────────────────────────────

  async createDocumentSigner(
    file: Express.Multer.File,
    data: {
      documentTypeId?: number;
      name: string;
      position: string;
      scopeType?: string;
      scopeId?: number;
    },
  ) {
    const key = `document-signers/${Date.now()}-${file.originalname}`;
    await this.storage.uploadFile(key, file.buffer, file.mimetype);

    return this.prisma.documentSigner.create({
      data: {
        documentTypeId: data.documentTypeId ?? null,
        name: data.name,
        position: data.position,
        signatureFilePath: key,
        scopeType: data.scopeType ?? null,
        scopeId: data.scopeId ?? null,
      },
      include: { documentType: true },
    });
  }

  async findAllDocumentSigners(documentTypeId?: number) {
    const where: any = { isActive: true };
    if (documentTypeId) where.documentTypeId = documentTypeId;
    const signers = await this.prisma.documentSigner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { documentType: true },
    });
    return Promise.all(
      signers.map(async (s) => ({
        ...s,
        signatureUrl: await this.storage.getFileUrl(s.signatureFilePath),
      })),
    );
  }

  async updateDocumentSigner(id: number, data: Partial<{
    name: string;
    position: string;
    isActive: boolean;
  }>) {
    const signer = await this.prisma.documentSigner.findUnique({ where: { id } });
    if (!signer) throw new NotFoundException(`Signer #${id} tidak ditemukan`);
    return this.prisma.documentSigner.update({ where: { id }, data });
  }

  async deleteDocumentSigner(id: number) {
    const signer = await this.prisma.documentSigner.findUnique({ where: { id } });
    if (!signer) throw new NotFoundException(`Signer #${id} tidak ditemukan`);
    await this.storage.deleteFile(signer.signatureFilePath);
    await this.prisma.documentSigner.delete({ where: { id } });
    return { message: 'Signer berhasil dihapus' };
  }

  // ─── Document Stamps ──────────────────────────────────────────────────────────

  async createDocumentStamp(
    file: Express.Multer.File,
    data: {
      documentTypeId?: number;
      name: string;
      scopeType?: string;
      scopeId?: number;
    },
  ) {
    const key = `document-stamps/${Date.now()}-${file.originalname}`;
    await this.storage.uploadFile(key, file.buffer, file.mimetype);

    return this.prisma.documentStamp.create({
      data: {
        documentTypeId: data.documentTypeId ?? null,
        name: data.name,
        stampFilePath: key,
        scopeType: data.scopeType ?? null,
        scopeId: data.scopeId ?? null,
      },
      include: { documentType: true },
    });
  }

  async findAllDocumentStamps(documentTypeId?: number) {
    const where: any = { isActive: true };
    if (documentTypeId) where.documentTypeId = documentTypeId;
    const stamps = await this.prisma.documentStamp.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { documentType: true },
    });
    return Promise.all(
      stamps.map(async (s) => ({
        ...s,
        stampUrl: await this.storage.getFileUrl(s.stampFilePath),
      })),
    );
  }

  async updateDocumentStamp(id: number, data: Partial<{
    name: string;
    isActive: boolean;
  }>) {
    const stamp = await this.prisma.documentStamp.findUnique({ where: { id } });
    if (!stamp) throw new NotFoundException(`Stamp #${id} tidak ditemukan`);
    return this.prisma.documentStamp.update({ where: { id }, data });
  }

  async deleteDocumentStamp(id: number) {
    const stamp = await this.prisma.documentStamp.findUnique({ where: { id } });
    if (!stamp) throw new NotFoundException(`Stamp #${id} tidak ditemukan`);
    await this.storage.deleteFile(stamp.stampFilePath);
    await this.prisma.documentStamp.delete({ where: { id } });
    return { message: 'Stamp berhasil dihapus' };
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
