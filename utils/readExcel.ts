// utils/readExcel.ts
import * as XLSX from 'xlsx';
import path from 'path';

export function readExcel(filePath: string, sheetName?: string) {
  const workbook = XLSX.readFile(path.resolve(filePath));
  const sheet = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheet];
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  return jsonData;
}
