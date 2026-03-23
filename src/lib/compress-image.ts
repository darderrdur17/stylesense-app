/**
 * Resize and JPEG-compress images in the browser so data URLs stay under upload limits.
 */
export async function compressImageForUpload(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<Blob> {
  const mime = file.type || "image/jpeg";
  if (mime === "image/gif") {
    return file;
  }

  const bmp = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxWidth / bmp.width);
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not compress image"))),
        "image/jpeg",
        quality
      );
    });
  } finally {
    bmp.close();
  }
}
