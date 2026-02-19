export function buildExtractedImageFileName(pageIndex: number, imageIndex: number): string {
  return `page-${pageIndex + 1}-image-${imageIndex + 1}.png`;
}

export function buildZipFileName(pdfFileName: string): string {
  const baseName = pdfFileName.trim().replace(/\.pdf$/i, "");
  const normalizedBaseName = baseName.length > 0 ? baseName : "images";
  return `${normalizedBaseName}-images.zip`;
}
