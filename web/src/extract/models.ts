export type ExtractedImageItem = {
  pageIndex: number;
  pngBytes: Uint8Array;
};

export type ExtractedErrorItem = {
  pageIndex: number | null;
  kind: string;
  message: string;
};

export type ExtractResult = {
  images: ExtractedImageItem[];
  errors: ExtractedErrorItem[];
};

export const UNKNOWN_ERROR_ITEM: ExtractedErrorItem = {
  pageIndex: null,
  kind: "unknown",
  message: "unknown error",
};
