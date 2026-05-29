/**
 * Utility functions for exporting data list arrays to CSV files
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
) {
  if (!data || !data.length) {
    alert("Não há dados disponíveis para exportar.");
    return;
  }

  // Generate headers row
  const headerRow = headers.map(h => `"${String(h.label).replace(/"/g, '""')}"`).join(",");

  // Generate data rows
  const rows = data.map(item => {
    return headers.map(h => {
      const val = item[h.key];
      const stringVal = val === undefined || val === null ? "" : String(val);
      return `"${stringVal.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    }).join(",");
  });

  // Assemble CSV with UTF-8 byte order mark (BOM) to support accented letters in Excel
  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
