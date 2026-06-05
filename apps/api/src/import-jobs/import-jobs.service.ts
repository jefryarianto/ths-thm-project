import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ImportJobsService {
  private readonly logger = new Logger(ImportJobsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: {
    importType: string;
    fileName: string;
    filePath?: string;
    importedBy: number;
  }) {
    return this.prisma.importJob.create({ data });
  }

  async findAll(page = 1, limit = 20, importType?: string) {
    const where: any = {};
    if (importType) where.importType = importType;

    const [data, total] = await Promise.all([
      this.prisma.importJob.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          pengimport: { select: { id: true, name: true } },
          _count: { select: { rowLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.importJob.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const job = await this.prisma.importJob.findUnique({
      where: { id },
      include: {
        pengimport: { select: { id: true, name: true } },
        rowLogs: {
          orderBy: { rowNumber: 'asc' },
          take: 100,
        },
      },
    });
    if (!job) throw new NotFoundException('Import job not found');
    return job;
  }

  async getRowLogs(importJobId: number, status?: string, page = 1, limit = 50) {
    const where: any = { importJobId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.importRowLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rowNumber: 'asc' },
      }),
      this.prisma.importRowLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async processImport(
    jobId: number,
    rows: Array<Record<string, unknown>>,
    importType: string,
  ) {
    // Update status to processing
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: 'processing',
        totalRows: rows.length,
      },
    });

    let successRows = 0;
    let warningRows = 0;
    let errorRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      try {
        switch (importType) {
          case 'anggota':
            await this.processAnggotaRow(row, jobId, rowNumber);
            successRows++;
            break;
          case 'calon_anggota':
            await this.processCalonAnggotaRow(row, jobId, rowNumber);
            successRows++;
            break;
          default:
            warningRows++;
            await this.createRowLog(jobId, rowNumber, row, 'warning', [
              `Unknown import type: ${importType}`,
            ]);
        }
      } catch (err: any) {
        errorRows++;
        await this.createRowLog(jobId, rowNumber, row, 'error', [
          err.message || 'Unknown error',
        ]);
      }
    }

    // Update final status
    const finalStatus = errorRows > 0 ? 'completed_with_errors' : 'completed';
    return this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        successRows,
        warningRows,
        errorRows,
      },
    });
  }

  private async processAnggotaRow(
    row: Record<string, unknown>,
    jobId: number,
    rowNumber: number,
  ) {
    const { nomorAnggota, namaLengkap, jenisKelamin, rantingId, noHp, email, tempatLahir, tanggalLahir, alamat } = row as any;

    if (!nomorAnggota || !namaLengkap || !jenisKelamin || !rantingId) {
      throw new Error('Missing required fields: nomorAnggota, namaLengkap, jenisKelamin, rantingId');
    }

    const existing = await this.prisma.anggota.findUnique({
      where: { nomorAnggota: String(nomorAnggota) },
    });

    if (existing) {
      // Update existing
      await this.prisma.anggota.update({
        where: { id: existing.id },
        data: {
          namaLengkap: String(namaLengkap),
          noHp: noHp ? String(noHp) : undefined,
          email: email ? String(email) : undefined,
          tempatLahir: tempatLahir ? String(tempatLahir) : undefined,
          tanggalLahir: tanggalLahir ? new Date(String(tanggalLahir)) : undefined,
          alamat: alamat ? String(alamat) : undefined,
        },
      });
      await this.createRowLog(jobId, rowNumber, row as any, 'success', [
        'Updated existing member',
      ]);
    } else {
      // Create new
      const anggota = await this.prisma.anggota.create({
        data: {
          nomorAnggota: String(nomorAnggota),
          namaLengkap: String(namaLengkap),
          jenisKelamin: String(jenisKelamin),
          rantingId: Number(rantingId),
          noHp: noHp ? String(noHp) : undefined,
          email: email ? String(email) : undefined,
          tempatLahir: tempatLahir ? String(tempatLahir) : undefined,
          tanggalLahir: tanggalLahir ? new Date(String(tanggalLahir)) : undefined,
          alamat: alamat ? String(alamat) : undefined,
        },
      });
      await this.createRowLog(jobId, rowNumber, row as any, 'success', [], String(anggota.id));
    }
  }

  private async processCalonAnggotaRow(
    row: Record<string, unknown>,
    jobId: number,
    rowNumber: number,
  ) {
    const { namaLengkap, jenisKelamin, rantingId, usulOlehUserId, noHp, email } = row as any;

    if (!namaLengkap || !jenisKelamin || !rantingId || !usulOlehUserId) {
      throw new Error('Missing required fields: namaLengkap, jenisKelamin, rantingId, usulOlehUserId');
    }

    const calon = await this.prisma.calonAnggota.create({
      data: {
        namaLengkap: String(namaLengkap),
        jenisKelamin: String(jenisKelamin),
        rantingId: Number(rantingId),
        usulOlehUserId: Number(usulOlehUserId),
        noHp: noHp ? String(noHp) : undefined,
        email: email ? String(email) : undefined,
      },
    });
    await this.createRowLog(jobId, rowNumber, row as any, 'success', [], String(calon.id));
  }

  private async createRowLog(
    importJobId: number,
    rowNumber: number,
    rawData: Record<string, unknown>,
    status: string,
    messages: string[],
    createdRecordId?: string,
  ) {
    return this.prisma.importRowLog.create({
      data: {
        importJobId,
        rowNumber,
        rawData: rawData as any,
        status,
        messages,
        createdRecordId,
      },
    });
  }
}
