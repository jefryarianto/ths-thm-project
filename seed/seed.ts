import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Roles ───
  const roles = await Promise.all([
    prisma.role.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nama: 'Superadmin', scope: 'superadmin', permissions: ['*'] } }),
    prisma.role.upsert({ where: { id: 2 }, update: {}, create: { id: 2, nama: 'Admin Distrik', scope: 'admin_distrik', permissions: ['anggota:*', 'iuran:*', 'konten:approve', 'dokumen:*', 'claim:*'] } }),
    prisma.role.upsert({ where: { id: 3 }, update: {}, create: { id: 3, nama: 'Pengurus Ranting', scope: 'pengurus_ranting', permissions: ['anggota:read', 'latihan:*', 'absensi:*'] } }),
    prisma.role.upsert({ where: { id: 4 }, update: {}, create: { id: 4, nama: 'Pelatih', scope: 'pelatih', permissions: ['latihan:*', 'absensi:*'] } }),
    prisma.role.upsert({ where: { id: 5 }, update: {}, create: { id: 5, nama: 'Anggota', scope: 'anggota', permissions: ['self:*', 'anggota:read'] } }),
  ]);
  console.log(`✓ Created ${roles.length} roles`);

  // ─── Organisasi ───
  const distrik = await prisma.organisasi.upsert({
    where: { id: 1 }, update: {},
    create: { id: 1, nama: 'Distrik Larantuka', tingkat: 'Distrik', alamat: 'Larantuka, Flores Timur, NTT' },
  });
  const wilayah = await prisma.organisasi.upsert({
    where: { id: 2 }, update: {},
    create: { id: 2, nama: 'Wilayah Larantuka 1', tingkat: 'Wilayah', alamat: 'Larantuka', indukId: distrik.id },
  });
  const ranting = await prisma.organisasi.upsert({
    where: { id: 3 }, update: {},
    create: { id: 3, nama: 'Ranting St. Yosef', tingkat: 'Ranting', alamat: 'Larantuka', indukId: wilayah.id },
  });
  console.log('✓ Created organization structure');

  // ─── Admin User ───
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ths-thm.org',
      nomorHp: '081234567890',
      passwordHash: adminPassword,
      roleId: 1,
      isActive: true,
    },
  });
  console.log(`✓ Created admin user (password: admin123)`);

  // ─── Pelatih User ───
  const pelatihPassword = await bcrypt.hash('pelatih123', 10);
  const pelatihUser = await prisma.user.upsert({
    where: { username: 'pelatih1' },
    update: {},
    create: {
      username: 'pelatih1',
      email: 'pelatih@ths-thm.org',
      nomorHp: '081234567891',
      passwordHash: pelatihPassword,
      roleId: 4,
      isActive: true,
    },
  });
  console.log('✓ Created pelatih user (password: pelatih123)');

  // ─── Sample Anggota ───
  const anggotaData = [
    { nomorAnggota: 'THS-001', nama: 'Yohanes Don Bosco', tempatLahir: 'Larantuka', tanggalLahir: new Date('1995-03-15'), jenisKelamin: 'L' as const, alamat: 'Jl. Gereja No. 1, Larantuka', nomorHp: '081234567801', email: 'yohanes@example.com', rantingId: ranting.id, distrikId: distrik.id, tempatDadar: 'Larantuka', tanggalDadar: new Date('2015-06-20'), level: 'Dasar' },
    { nomorAnggota: 'THS-002', nama: 'Maria Goreti', tempatLahir: 'Maumere', tanggalLahir: new Date('1998-07-22'), jenisKelamin: 'P' as const, alamat: 'Jl. Katedral No. 5, Maumere', nomorHp: '081234567802', email: 'maria@example.com', rantingId: ranting.id, distrikId: distrik.id, tempatDadar: 'Maumere', tanggalDadar: new Date('2016-08-15'), level: 'Madya' },
    { nomorAnggota: 'THS-003', nama: 'Petrus Paulus', tempatLahir: 'Ende', tanggalLahir: new Date('1993-11-08'), jenisKelamin: 'L' as const, alamat: 'Jl. Merdeka No. 12, Ende', nomorHp: '081234567803', email: 'petrus@example.com', rantingId: ranting.id, distrikId: distrik.id, tempatDadar: 'Ende', tanggalDadar: new Date('2014-04-10'), level: 'Dasar' },
    { nomorAnggota: 'THS-004', nama: 'Agnes Theresia', tempatLahir: 'Lewoleba', tanggalLahir: new Date('2000-01-30'), jenisKelamin: 'P' as const, alamat: 'Jl. Pasar No. 3, Lewoleba', nomorHp: '081234567804', email: 'agnes@example.com', rantingId: ranting.id, distrikId: distrik.id, tempatDadar: 'Lewoleba', tanggalDadar: new Date('2017-09-25'), level: 'Madya' },
    { nomorAnggota: 'THS-005', nama: 'Fransiskus Asisi', tempatLahir: 'Larantuka', tanggalLahir: new Date('1996-05-20'), jenisKelamin: 'L' as const, alamat: 'Jl. Pantai No. 8, Larantuka', nomorHp: '081234567805', email: 'frans@example.com', rantingId: ranting.id, distrikId: distrik.id, tempatDadar: 'Larantuka', tanggalDadar: new Date('2015-12-12'), level: 'Dasar' },
  ];

  // Anggota user
  const anggotaPassword = await bcrypt.hash('anggota123', 10);

  for (const data of anggotaData) {
    const anggota = await prisma.anggota.upsert({
      where: { nomorAnggota: data.nomorAnggota },
      update: {},
      create: {
        nomorAnggota: data.nomorAnggota,
        nama: data.nama,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir,
        jenisKelamin: data.jenisKelamin,
        alamat: data.alamat,
        nomorHp: data.nomorHp,
        email: data.email,
        rantingId: data.rantingId,
        wilayahId: wilayah.id,
        distrikId: data.distrikId,
        tempatDadar: data.tempatDadar,
        tanggalDadar: data.tanggalDadar,
        level: data.level,
        status: 'Aktif',
      },
    });

    // Create user account for anggota
    const username = data.nama.toLowerCase().replace(/\s+/g, '.');
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: data.email,
        nomorHp: data.nomorHp,
        passwordHash: anggotaPassword,
        roleId: 5,
        anggotaId: anggota.id,
        isActive: true,
      },
    });
  }
  console.log(`✓ Created ${anggotaData.length} sample members with user accounts`);

  // ─── Iuran Sample ───
  const allAnggota = await prisma.anggota.findMany();
  for (const anggota of allAnggota) {
    for (let month = 1; month <= 6; month++) {
      await prisma.iuran.create({
        data: {
          anggotaId: anggota.id,
          jenis: 'Wajib',
          jumlah: 50000,
          tanggalBayar: new Date(2024, month, 15),
          bulan: month,
          tahun: 2024,
          keterangan: `Iuran wajib bulan ${month}/2024`,
        },
      });
    }
  }
  console.log('✓ Created sample iuran records');

  // ─── Konten Sample ───
  const kontenData = [
    { judul: 'Perayaan Paskah THS-THM 2024', jenis: 'Berita', konten: 'Perayaan Paskah tahun ini diadakan di Gereja Katedral Larantuka dengan dihadiri oleh seluruh anggota THS-THM dari berbagai ranting.', status: 'Dipublikasikan' },
    { judul: 'Materi Latihan: Kepemimpinan Kristiani', jenis: 'Artikel', konten: 'Kepemimpinan Kristiani adalah pelayanan yang didasarkan pada nilai-nilai Injil...', status: 'Dipublikasikan' },
    { judul: 'Ret Anggota Baru 2024', jenis: 'Acara', konten: 'Ret-ret anggota baru akan diadakan pada tanggal 20-22 Desember 2024 di Pusat Ret-ret Larantuka.', status: 'Menunggu Persetujuan' },
    { judul: 'Renungan Mingguan: Kasih Persaudaraan', jenis: 'Artikel', konten: 'Kasih persaudaraan merupakan ciri khas pengikut Kristus...', status: 'Dipublikasikan' },
  ];

  for (const k of kontenData) {
    await prisma.konten.create({
      data: {
        judul: k.judul,
        jenis: k.jenis,
        konten: k.konten,
        status: k.status,
        penulisId: admin.id,
        publishedAt: k.status === 'Dipublikasikan' ? new Date() : null,
      },
    });
  }
  console.log('✓ Created sample konten');

  // ─── Pendadaran Aspects & Items ───
  const aspekData = [
    { nama: 'Pengetahuan Kitab Suci', bobot: 25, urutan: 1, deskripsi: 'Pengetahuan umum tentang Kitab Suci Perjanjian Lama dan Baru' },
    { nama: 'Doktrin Gereja Katolik', bobot: 25, urutan: 2, deskripsi: 'Pemahaman tentang ajaran-ajaran dasar Gereja Katolik' },
    { nama: 'Sejarah THS-THM', bobot: 20, urutan: 3, deskripsi: 'Pengetahuan tentang sejarah berdirinya THS-THM' },
    { nama: 'Praktik Kepemimpinan', bobot: 15, urutan: 4, deskripsi: 'Kemampuan praktik memimpin dan mengorganisir kegiatan' },
    { nama: 'Lagu & Liturgi', bobot: 15, urutan: 5, deskripsi: 'Pengetahuan lagu-lagu gerejani dan tata liturgi' },
  ];

  for (const a of aspekData) {
    const aspek = await prisma.pendadaranAspek.upsert({
      where: { id: a.urutan },
      update: {},
      create: a,
    });

    // Create items for each aspect
    if (a.nama === 'Pengetahuan Kitab Suci') {
      await prisma.pendadaranItem.createMany({ data: [
        { aspekId: aspek.id, nama: 'Perjanjian Lama', minScore: 0, maxScore: 100, urutan: 1 },
        { aspekId: aspek.id, nama: 'Perjanjian Baru', minScore: 0, maxScore: 100, urutan: 2 },
        { aspekId: aspek.id, nama: 'Injil Sinoptik', minScore: 0, maxScore: 100, urutan: 3 },
      ], skipDuplicates: true });
    }
  }
  console.log('✓ Created pendadaran aspects & items');

  console.log('\n✅ Seeding completed!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:   admin / admin123');
  console.log('   Pelatih: pelatih1 / pelatih123');
  console.log('   Anggota: yohanes.don.bosco / anggota123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
