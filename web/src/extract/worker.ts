import * as Comlink from "comlink";
import init, { extractImages } from "extract-wasm";
import wasmUrl from "extract-wasm/extract_wasm_bg.wasm?url";
import { err, ok, Result, ResultAsync } from "neverthrow";
import type { PageRange } from "./page-range";
import {
  UNKNOWN_ERROR_ITEM,
  type ExtractedErrorItem,
  type ExtractedImageItem,
  type ExtractResult,
} from "./models";
import { toWorkerResult, type WorkerApi, type WorkerExtractResult } from "./worker-interface";

function parseWasmResponseObject(value: unknown): Result<Record<string, unknown>, string> {
  if (!value || typeof value !== "object") {
    return err("failed to parse response from wasm module");
  }
  return ok(value as Record<string, unknown>);
}

function parsePngBytes(value: unknown): Result<Uint8Array, string> {
  if (value instanceof Uint8Array) {
    return ok(value);
  }
  if (value instanceof ArrayBuffer) {
    return ok(new Uint8Array(value));
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return ok(Uint8Array.from(value));
  }
  return err("failed to parse image bytes");
}

function parsePageIndex(value: unknown): Result<number, string> {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return err("failed to parse page index");
  }
  return ok(value);
}

function parseExtractedImageItem(value: unknown): Result<ExtractedImageItem, ExtractedErrorItem> {
  if (!value || typeof value !== "object") {
    return err({ ...UNKNOWN_ERROR_ITEM });
  }
  const image = value as Record<string, unknown>;

  const pageIndex = parsePageIndex(image.pageIndex);
  if (pageIndex.isErr()) {
    return err({ ...UNKNOWN_ERROR_ITEM });
  }

  const pngBytes = parsePngBytes(image.pngBytes);
  if (pngBytes.isErr()) {
    return err({ ...UNKNOWN_ERROR_ITEM, pageIndex: pageIndex.value });
  }

  return ok({
    pageIndex: pageIndex.value,
    pngBytes: pngBytes.value,
  });
}

function parseExtractedErrorItem(value: unknown): ExtractedErrorItem {
  if (!value || typeof value !== "object") {
    return { ...UNKNOWN_ERROR_ITEM };
  }
  const errorItem = value as Record<string, unknown>;

  if (
    !(
      typeof errorItem.pageIndex === "number" ||
      errorItem.pageIndex === null ||
      errorItem.pageIndex === undefined
    )
  ) {
    return { ...UNKNOWN_ERROR_ITEM };
  }
  if (typeof errorItem.kind !== "string" || typeof errorItem.message !== "string") {
    return { ...UNKNOWN_ERROR_ITEM };
  }
  const pageIndex = typeof errorItem.pageIndex === "number" ? errorItem.pageIndex : null;

  return {
    pageIndex,
    kind: errorItem.kind,
    message: errorItem.message,
  };
}

function normalizeUnknownErrorMessage(value: unknown): string {
  if (!value || typeof value !== "string") {
    return "unknown error";
  }
  return value;
}

type WasmRange = {
  start: number;
  end: number;
};

const extractImagesWithRanges = extractImages as unknown as (
  pdfBytes: Uint8Array,
  ranges?: WasmRange[],
) => unknown;

function toWasmRanges(pageRanges: PageRange[]): WasmRange[] | undefined {
  if (pageRanges.length === 0) {
    return undefined;
  }
  return pageRanges.map((pageRange) => ({
    start: pageRange.start,
    end: pageRange.end,
  }));
}

function parseExtractedResult(value: Record<string, unknown>): ExtractResult {
  const rawImages: unknown[] = Array.isArray(value.images) ? value.images : [];
  const parsedImageResults = rawImages.map(parseExtractedImageItem);
  const images = parsedImageResults.filter((result) => result.isOk()).map((result) => result.value);

  const rawErrors: unknown[] = Array.isArray(value.errors) ? value.errors : [];
  const errors: ExtractedErrorItem[] = rawErrors.map(parseExtractedErrorItem);
  parsedImageResults
    .filter((result) => result.isErr())
    .forEach((result) => errors.push(result.error));

  return { images, errors };
}

const api: WorkerApi = {
  extractImages: async (
    pdfBytes: Uint8Array,
    pageRanges: PageRange[] = [],
  ): Promise<WorkerExtractResult> => {
    const result = await ResultAsync.fromPromise(
      init({ module_or_path: wasmUrl }),
      () => "failed to initialize wasm module",
    )
      .andThen(() =>
        Result.fromThrowable(
          () => extractImagesWithRanges(pdfBytes, toWasmRanges(pageRanges)),
          normalizeUnknownErrorMessage,
        )()
          .andThen(parseWasmResponseObject)
          .map(parseExtractedResult),
      )
      .map((extractedData) => {
        const transferables = extractedData.images.map((img) => img.pngBytes.buffer);
        return Comlink.transfer(extractedData, transferables);
      });
    return toWorkerResult(result);
  },
};

Comlink.expose(api);
