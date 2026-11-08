import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

function publicIdFromUrl(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[A-Za-z0-9]+$/);
  return match ? match[1] : null;
}

export function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'campus-exchange/listings' }, (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}

export async function deleteImages(urls) {
  const ids = urls.map(publicIdFromUrl).filter(Boolean);
  if (ids.length === 0) return;

  const results = await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('Cloudinary cleanup failed:', r.reason?.message);
  });
}