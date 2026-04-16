export async function convertHeicToJpeg(file: File): Promise<File> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) return file;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/convert-heic', { method: 'POST', body: formData });

  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: 'HEIC conversion failed' }));
    throw new Error(error ?? 'HEIC conversion failed');
  }

  const blob = await response.blob();
  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
  return new File([blob], newName, { type: 'image/jpeg' });
}
