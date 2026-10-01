/**
 * Shrink a photo from the camera before it goes anywhere. Phone cameras produce
 * 3–8 MB files; an ID card is perfectly readable at 1280px, and a profile
 * photo needs far less. Returns a JPEG data URL.
 */
export async function compressImage(
  file: File,
  { maxSize = 1280, quality = 0.75, square = false } = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a photo (JPG or PNG).");
  }

  // Respects the EXIF orientation, so portrait phone shots stay upright.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (square) {
    const side = Math.min(sw, sh);
    sx = (sw - side) / 2;
    sy = (sh - side) / 2;
    sw = sh = side;
  }

  const scale = Math.min(1, maxSize / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot process photos.");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
