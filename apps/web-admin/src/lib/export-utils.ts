import * as XLSX from "xlsx";

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: unknown, row: T) => string;
}

export function exportToCsv<T extends object>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  if (data.length === 0) return;

  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const raw = col.key in row ? (row as Record<string, unknown>)[col.key as string] : "";
      const value = col.format ? col.format(raw, row) : String(raw ?? "");
      // Escape CSV values: wrap in quotes if contains comma, quote, or newline
      if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
  );

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToXlsx<T extends object>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  if (data.length === 0) return;

  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const raw = col.key in row ? (row as Record<string, unknown>)[col.key as string] : "";
      return col.format ? col.format(raw, row) : String(raw ?? "");
    })
  );

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-fit column widths
  const colWidths = headers.map((header, i) => {
    const maxLen = Math.max(
      header.length,
      ...rows.map((row) => String(row[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, `${filename}.xlsx`);
}
