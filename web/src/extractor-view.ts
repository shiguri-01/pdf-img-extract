import type { ExtractedImageItem } from "./extract";

export type ExtractedImageView = ExtractedImageItem & {
  previewUrl: string;
};

export type RunStatus = "idle" | "running" | "success" | "error";

export function createPreviewUrl(pngBytes: Uint8Array): string {
  const blob = new Blob([Uint8Array.from(pngBytes)], { type: "image/png" });
  return URL.createObjectURL(blob);
}
