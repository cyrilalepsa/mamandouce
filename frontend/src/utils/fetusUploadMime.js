export const FETUS_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const FETUS_UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

export function isAcceptedFetusUpload(file) {
  if (!file) return false;
  const mime = (file.type || '').toLowerCase().split(';')[0].trim();
  if (FETUS_UPLOAD_MIME_TYPES.includes(mime)) return true;
  const name = (file.name || '').toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}
