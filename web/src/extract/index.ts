import * as Comlink from "comlink";
import type { PageRange } from "./page-range";
import type { ExtractResult } from "./models";
import { ResultAsync } from "neverthrow";
import { fromWorkerResult, type WorkerApi } from "./worker-interface";

export function extractImages(
  pdfBytes: Uint8Array,
  pageRange: PageRange = { start: null, end: null },
): ResultAsync<ExtractResult, string> {
  return ResultAsync.fromPromise(
    (async () => {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });
      const api = Comlink.wrap<WorkerApi>(worker);

      try {
        const workerResult = await api.extractImages(
          Comlink.transfer(pdfBytes, [pdfBytes.buffer]),
          pageRange,
        );
        const result = fromWorkerResult(workerResult);
        if (result.isErr()) {
          throw new Error(result.error);
        }
        return result.value;
      } finally {
        worker.terminate();
      }
    })(),
    (e) => (e instanceof Error ? e.message : String(e)),
  );
}

export type { ExtractResult, ExtractedImageItem, ExtractedErrorItem } from "./models";
