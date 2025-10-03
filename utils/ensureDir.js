import fs from 'fs';
import path from 'path';

export function ensureDirectoryExists(dirPath) {
  const full = path.resolve(dirPath);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
  }
}


