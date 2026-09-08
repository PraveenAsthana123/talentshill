import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.mp4', '.webm', '.mp3',
  '.csv', '.txt', '.json',
]);

export async function handleUpload(
  file: File,
  folder?: string
): Promise<{
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}> {
  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File type not allowed: ${ext}`);
  }

  // Create upload directory
  const targetDir = folder ? join(UPLOAD_DIR, folder) : UPLOAD_DIR;
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `${randomUUID()}${ext}`;
  const filePath = join(targetDir, filename);
  const relativePath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    path: filePath,
    url: relativePath,
  };
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch {
    // File may not exist, ignore
  }
}
