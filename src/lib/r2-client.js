import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET || 'nbecom-images';
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

export async function uploadToR2(key, buffer, contentType) {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key) {
  try {
    await R2.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
    return true;
  } catch (e) {
    console.error('R2 delete error:', e.message);
    return false;
  }
}

export function extractKeyFromUrl(url) {
  if (!url || !PUBLIC_URL) return null;
  if (url.startsWith(PUBLIC_URL)) {
    return url.slice(PUBLIC_URL.length + 1);
  }
  return null;
}
