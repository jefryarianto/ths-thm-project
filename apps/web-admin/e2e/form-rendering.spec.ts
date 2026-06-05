import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

interface CreatePageTestCase {
  entity: string;
  path: string;
  title: string;
  description: string;
  backHref: string;
  submitText: string;
  fields: { label: string; required?: boolean; type?: string }[];
  interactions?: { label: string; options: string[]; type: "toggle" }[];
}

const createPages: CreatePageTestCase[] = [
  {
    entity: "Anggota",
    path: "/anggota/create",
    title: "Tambah Anggota",
    description: "Isi data anggota baru",
    backHref: "/anggota",
    submitText: "Simpan",
    fields: [
      { label: "Nama Lengkap", required: true },
      { label: "Tempat Lahir" },
      { label: "Tanggal Lahir" },
      { label: "Nomor Anggota" },
      { label: "Nomor HP" },
      { label: "Jenis Kelamin" },
      { label: "Status" },
      { label: "Alamat" },
    ],
  },
  {
    entity: "Iuran",
    path: "/iuran/create",
    title: "Tambah Iuran",
    description: "Catat pembayaran iuran anggota",
    backHref: "/iuran",
    submitText: "Simpan",
    fields: [
      { label: "ID Anggota", required: true },
      { label: "Jenis Iuran" },
      { label: "Jumlah", required: true },
      { label: "Bulan" },
      { label: "Tahun" },
      { label: "Keterangan" },
    ],
  },
  {
    entity: "Kegiatan",
    path: "/kegiatan/create",
    title: "Tambah Kegiatan",
    description: "Buat kegiatan atau acara baru",
    backHref: "/kegiatan",
    submitText: "Simpan",
    fields: [
      { label: "Nama Kegiatan", required: true },
      { label: "Jenis Kegiatan", required: true },
      { label: "Tanggal Mulai", required: true },
      { label: "Lokasi", required: true },
      { label: "ID Penyelenggara" },
    ],
  },
  {
    entity: "Konten",
    path: "/konten/create",
    title: "Tambah Konten",
    description: "Buat konten publikasi baru",
    backHref: "/konten",
    submitText: "Buat Konten",
    fields: [
      { label: "Judul", required: true },
      { label: "Jenis Konten", required: true },
      { label: "Status" },
      { label: "Ringkasan" },
      { label: "Konten", required: true },
    ],
  },
  {
    entity: "Organisasi",
    path: "/organisasi/create",
    title: "Tambah Organisasi",
    description: "Tambah organisasi/ranting baru",
    backHref: "/organisasi",
    submitText: "Simpan",
    fields: [
      { label: "Nama Organisasi", required: true },
      { label: "Tingkat", required: true },
      { label: "Alamat" },
    ],
  },
  {
    entity: "Pendadaran",
    path: "/pendadaran/create",
    title: "Tambah Pendadaran",
    description: "Buat data ujian pendadaran baru",
    backHref: "/pendadaran",
    submitText: "Buat Pendadaran",
    fields: [
      { label: "Status", required: true },
      { label: "Nilai Akhir" },
      { label: "Predikat" },
    ],
  },
  {
    entity: "Pustaka",
    path: "/pustaka/create",
    title: "Tambah Pustaka",
    description: "Tambah materi atau dokumen baru",
    backHref: "/pustaka",
    submitText: "Simpan",
    fields: [
      { label: "Judul", required: true },
      { label: "Jenis", required: true },
      { label: "Deskripsi" },
      { label: "URL File" },
    ],
    interactions: [
      { label: "Visibilitas", options: ["Publik", "Internal"], type: "toggle" },
    ],
  },
  {
    entity: "Surat",
    path: "/surat/create",
    title: "Tambah Surat",
    description: "Catat surat masuk atau keluar",
    backHref: "/surat",
    submitText: "Simpan",
    fields: [
      { label: "Jenis Surat", required: true },
      { label: "Nomor Surat", required: true },
      { label: "Perihal", required: true },
      { label: "Tanggal Surat", required: true },
      { label: "Keterangan" },
    ],
    interactions: [
      { label: "Jenis Surat", options: ["Surat Masuk", "Surat Keluar"], type: "toggle" },
    ],
  },
];

test.describe("Create Pages — Form Rendering", () => {
  for (const pageCase of createPages) {
    test.describe(`/${pageCase.entity.toLowerCase()}`, () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page);
      });

      test("should display the page title and description", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: pageCase.title })).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(pageCase.description)).toBeVisible();
      });

      test("should have a back navigation link", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });

        // Prefer aria-label="Kembali" (used by konten & pendadaran)
        const backByLabel = page.locator('a[aria-label="Kembali"]');
        if ((await backByLabel.count()) > 0) {
          await expect(backByLabel).toBeVisible();
          await expect(backByLabel).toHaveAttribute("href", pageCase.backHref);
        } else {
          // Fallback: find any SVG icon in the header row, get parent anchor
          // The back link is the first link in the header's flex container
          await expect(page.getByRole("heading", { name: pageCase.title })).toBeVisible({ timeout: 10000 });
          // Find the first link element that points to the list page
          const backLink = page.locator(`a[href="${pageCase.backHref}"]`).first();
          await expect(backLink).toBeVisible();
          await expect(backLink).toHaveAttribute("href", pageCase.backHref);
        }
      });

      test("should have a Batal cancel link in the form footer", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        // Wait for page to be fully rendered
        await expect(page.getByRole("heading", { name: pageCase.title })).toBeVisible({ timeout: 10000 });
        const batalLink = page.getByRole("link", { name: /batal/i });
        await expect(batalLink).toBeVisible({ timeout: 5000 });
        await expect(batalLink).toHaveAttribute("href", pageCase.backHref);
      });

      test("should have a submit button", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: pageCase.title })).toBeVisible({ timeout: 10000 });
        const submitBtn = page.getByRole("button", { name: pageCase.submitText });
        await expect(submitBtn).toBeVisible({ timeout: 5000 });
        await expect(submitBtn).toBeEnabled();
      });

      test("should display all form field labels", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        for (const field of pageCase.fields) {
          // Use exact: false to match labels that may have * suffix for required fields
          const labelLocator = page.getByText(field.label, { exact: false });
          await expect(labelLocator.first()).toBeVisible({ timeout: 5000 });
        }
      });
    });
  }
});

test.describe("Create Pages — Toggle Interactions", () => {
  for (const pageCase of createPages) {
    const interactions = pageCase.interactions;
    if (!interactions) continue;

    test.describe(`/${pageCase.entity.toLowerCase()}`, () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page);
      });

      for (const interaction of interactions) {
        test(`should allow toggling "${interaction.label}"`, async ({ page }) => {
          await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
          for (const option of interaction.options) {
            const btn = page.getByRole("button", { name: new RegExp(option, "i") });
            await expect(btn).toBeVisible({ timeout: 5000 });
            await btn.click();
            await expect(btn).toBeVisible();
          }
        });
      }
    });
  }
});
