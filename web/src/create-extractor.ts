import { batch, createSignal } from "solid-js";
import { extractImages, type ExtractedErrorItem, type ExtractedImageItem } from "./extract";
import type { PageRange } from "./extract/page-range";

export type RunStatus = "idle" | "running" | "success" | "error";

export function createExtractor() {
  const [status, setStatus] = createSignal<RunStatus>("idle");

  const [images, setImages] = createSignal<ExtractedImageItem[]>([]);
  const [errors, setErrors] = createSignal<ExtractedErrorItem[]>([]);

  const [runtimeError, setRuntimeError] = createSignal<string | null>(null);

  const run = async (file: File, pageRange: PageRange) => {
    batch(() => {
      setStatus("running");
      setImages([]);
      setErrors([]);
      setRuntimeError(null);
    });

    try {
      const pdfBytes = new Uint8Array(await file.arrayBuffer());
      const result = await extractImages(pdfBytes, pageRange);

      if (result.isErr()) {
        setRuntimeError(result.error);
        setStatus("error");
        return;
      }

      setImages(result.value.images);
      setErrors(result.value.errors);
      setStatus("success");
    } catch {
      setRuntimeError("Unexpected Error");
      setImages([]);
      setErrors([]);
      setStatus("error");
    }
  };

  const clear = () =>
    batch(() => {
      setStatus("idle");
      setImages([]);
      setErrors([]);
      setRuntimeError(null);
    });

  return {
    status,
    images,
    errors,
    runtimeError,
    run,
    clear,
  };
}
