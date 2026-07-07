// Uploads exercise images to a Cloudflare R2 bucket over the S3-compatible API.
//
//   npm i -D @aws-sdk/client-s3
//   node scripts/upload-to-r2.mjs            # upload
//   DRY=1 node scripts/upload-to-r2.mjs      # print keys, upload nothing
//
// Reads UPLOAD_DIR recursively. The offline bundle stores images with flattened
// names like "Barbell_Bench_Press__0.jpg" — this script turns "__" back into "/"
// so the R2 keys match the paths stored in the seed (e.g. "Barbell_Bench_Press/0.jpg").
// Point NEXT_PUBLIC_IMAGE_BASE at the bucket's public URL afterwards.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_KEY_PREFIX = "",
  UPLOAD_DIR = "./forge-workout/images",
  DRY,
} = process.env;

if (!DRY && (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET)) {
  console.error("Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET in env.");
  process.exit(1);
}

const CONTENT_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const s3 = DRY
  ? null
  : new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function keyFor(file) {
  let rel = relative(UPLOAD_DIR, file).split(sep).join("/");
  // Flattened bundle names ("A__0.jpg") -> nested keys ("A/0.jpg").
  if (!rel.includes("/") && rel.includes("__")) rel = rel.replace(/__/g, "/");
  return R2_KEY_PREFIX + rel;
}

async function pool(items, size, fn) {
  let i = 0,
    done = 0;
  const queue = [...items];
  const worker = async () => {
    while (queue.length) {
      const it = queue.shift();
      await fn(it, ++i, items.length);
      if (++done % 100 === 0) console.log(`  ${done}/${items.length}`);
    }
  };
  await Promise.all(Array.from({ length: size }, worker));
}

const files = (await walk(UPLOAD_DIR)).filter((f) =>
  Object.keys(CONTENT_TYPE).includes(f.split(".").pop().toLowerCase())
);
console.log(`Found ${files.length} images in ${UPLOAD_DIR}`);

if (DRY) {
  files.slice(0, 10).forEach((f) => console.log(`  ${f}  ->  ${keyFor(f)}`));
  console.log(files.length > 10 ? `  …and ${files.length - 10} more` : "");
  console.log("Dry run — nothing uploaded.");
  process.exit(0);
}

await pool(files, 12, async (file) => {
  const key = keyFor(file);
  const ext = file.split(".").pop().toLowerCase();
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: await readFile(file),
      ContentType: CONTENT_TYPE[ext] || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
});

console.log(`Done. Uploaded ${files.length} images to bucket "${R2_BUCKET}".`);
console.log('Next: enable public access on the bucket, then set NEXT_PUBLIC_IMAGE_BASE to its public URL (with a trailing "/").');
