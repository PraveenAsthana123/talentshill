import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, normalize, relative, isAbsolute } from 'path';
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

// Real path-traversal fix: `folder` came straight from client-supplied
// FormData and was joined into a filesystem path with zero validation.
// join(UPLOAD_DIR, '../../../../etc') resolves '..' segments and
// escapes the intended uploads directory entirely -- a real arbitrary-
// directory-write vulnerability (the final filename is still a random
// UUID, but the directory it lands in was fully attacker-controlled).
// Strips traversal/absolute-path attempts and re-validates the
// resolved path is still inside UPLOAD_DIR before ever touching disk.
function sanitizeFolder(folder?: string): string | undefined {
  if (!folder) return undefined;
  const candidate = normalize(folder).replace(/^(\.\.[/\\])+/, '');
  if (isAbsolute(candidate) || candidate.split(/[/\\]/).includes('..')) {
    throw new Error('Invalid folder path');
  }
  const resolvedDir = join(UPLOAD_DIR, candidate);
  const rel = relative(UPLOAD_DIR, resolvedDir);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('Invalid folder path');
  }
  return candidate;
}

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

  const safeFolder = sanitizeFolder(folder);

  // Create upload directory
  const targetDir = safeFolder ? join(UPLOAD_DIR, safeFolder) : UPLOAD_DIR;
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `${randomUUID()}${ext}`;
  const filePath = join(targetDir, filename);
  const relativePath = safeFolder ? `/uploads/${safeFolder}/${filename}` : `/uploads/${filename}`;

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
