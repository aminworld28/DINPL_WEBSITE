import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns its public URL (images) or
 * signed access path (CVs, admin-only bucket).
 * @param {File} file
 * @param {string} folder - subfolder within the bucket, e.g. "brands", "team", "posts"
 * @param {'images'|'cvs'} bucket
 */
const ALLOWED_CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export async function uploadFile(file, folder, bucket = 'images') {
  if (!file) throw new Error('No file provided');

  const maxSizeMb = bucket === 'cvs' ? 10 : 5;
  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`File is too large. Max ${maxSizeMb}MB.`);
  }

  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (bucket === 'cvs') {
    const typeOk = ALLOWED_CV_TYPES.includes(file.type);
    const extOk = ALLOWED_CV_EXTENSIONS.includes(ext);
    // Require both to look right. This is a usability check, not a security
    // boundary by itself (both are client-reported and spoofable) - the real
    // protection against a malicious file is forcing downloads in
    // getSignedCvUrl() below, so a renamed/fake file can never execute.
    if (!typeOk || !extOk) {
      throw new Error('Please upload a PDF or Word document (.pdf, .doc, .docx).');
    }
  } else {
    // Images bucket is public-read, so a non-image file uploaded here would be
    // served directly from your domain. Admin-only upload path, but this stops
    // a wrong/malicious file from ending up publicly hosted by mistake.
    const typeOk = ALLOWED_IMAGE_TYPES.includes(file.type);
    const extOk = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    if (!typeOk || !extOk) {
      throw new Error('Please upload a JPG, PNG, WEBP, or GIF image.');
    }
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

/**
 * Generates a temporary signed URL for a private CV file (Admin use only).
 * `download: true` forces the browser to download rather than render the file
 * inline - critical here, since CVs are uploaded by the public and a malicious
 * file (e.g. HTML/JS renamed to look like a PDF) must never execute in an
 * authenticated admin's browser session.
 */
export async function getSignedCvUrl(path, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from('cvs').createSignedUrl(path, expiresInSeconds, { download: true });
  if (error) throw error;
  return data.signedUrl;
}
