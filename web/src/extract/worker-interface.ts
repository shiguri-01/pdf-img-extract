import type { ExtractResult } from "./models";
import { ok, err, type Result } from "neverthrow";
import type { PageRange } from "./page-range";

export type WorkerApi = {
  extractImages: (pdfBytes: Uint8Array, pageRange?: PageRange) => Promise<WorkerExtractResult>;
};

// Workerで転送するときにResultのメソッドが剥がれてしまうので
// 付け直すためのヘルパー
export type WorkerExtractResult = { value: ExtractResult } | { error: string };

export const fromWorkerResult = (
  workerResult: WorkerExtractResult,
): Result<ExtractResult, string> =>
  "value" in workerResult ? ok(workerResult.value) : err(workerResult.error);

export const toWorkerResult = (result: Result<ExtractResult, string>): WorkerExtractResult =>
  result.match(
    (value) => ({ value }),
    (error) => ({ error }),
  );
