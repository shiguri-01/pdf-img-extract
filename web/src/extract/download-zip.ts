import type { ExtractedImageItem } from "./models";
import { buildExtractedImageFileName, buildZipFileName } from "./file-names";

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadImagesZip(
  pdfFileName: string,
  images: ExtractedImageItem[],
): Promise<void> {
  if (images.length === 0) {
    throw new Error("No images to download.");
  }

  const { zipSync } = await import("fflate");
  const entries: Record<string, Uint8Array> = {};

  for (const [index, image] of images.entries()) {
    const entryName = buildExtractedImageFileName(image.pageIndex, index);
    entries[entryName] = Uint8Array.from(image.pngBytes);
  }

  const zipBytes = zipSync(entries);
  const zipBlob = new Blob([new Uint8Array(zipBytes)], { type: "application/zip" });
  triggerDownload(zipBlob, buildZipFileName(pdfFileName));
}
