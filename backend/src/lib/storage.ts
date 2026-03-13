import fs from "fs/promises";
import path from "path";

const localRoot = path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || "uploads");

export async function ensureStorageRoot() {
  await fs.mkdir(localRoot, { recursive: true });
  return localRoot;
}

export async function saveEvidenceFile(args: { fileName: string; content: Buffer | string }) {
  await ensureStorageRoot();
  const safe = `${Date.now()}-${args.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const full = path.join(localRoot, safe);
  await fs.writeFile(full, args.content);
  return {
    driver: process.env.STORAGE_DRIVER || "local",
    path: full,
    publicUrl: process.env.PUBLIC_UPLOAD_BASE ? `${process.env.PUBLIC_UPLOAD_BASE.replace(/\/$/,"")}/${safe}` : null,
  };
}
