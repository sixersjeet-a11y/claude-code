import path from 'path';
import { promises as fs } from 'fs';

const baseDir = path.join(process.cwd(), 'uploads');

export async function persistFile(fileName: string, data: ArrayBuffer) {
  await fs.mkdir(baseDir, { recursive: true });
  const filePath = path.join(baseDir, `${Date.now()}-${fileName}`);
  await fs.writeFile(filePath, Buffer.from(data));
  return filePath;
}
