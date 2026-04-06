import path from 'path';
import { promises as fs } from 'fs';

const baseDir = path.join(process.cwd(), 'uploads');

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function persistFile(fileName: string, data: ArrayBuffer) {
  await fs.mkdir(baseDir, { recursive: true });
  const safeName = sanitizeFileName(fileName);
  const filePath = path.join(baseDir, `${Date.now()}-${safeName}`);
  await fs.writeFile(filePath, Buffer.from(data));
  return filePath;
}
