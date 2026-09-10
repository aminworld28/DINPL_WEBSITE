import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns its public URL (images) or
 * signed access path (CVs, admin-only bucket).
 * @param {File} file
 * @param {string} folder - subfolder within the bucket, e.g. "brands", "team", "posts"
 * @param {'images'|'cvs'} bucket
 */
export async function uploadFile(file, folder, bucket = 'images') {
  if (!file) throw new Error('No file provided');

  const maxSizeMb = bucket === 'cvs' ? 10 : 5;
  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`File is too large. Max ${maxSizeMb}MB.`);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${folder}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;

  if (bucket === 'images') {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // CVs bucket is private - store the path; Admin generates a signed URL when viewing
  return path;
}

/** Generates a temporary signed URL for a private CV file (Admin use only). */
export async function getSignedCvUrl(path, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from('cvs').createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
