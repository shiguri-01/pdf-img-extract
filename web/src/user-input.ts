import { ok, type Result } from "neverthrow";
import { parsePageRanges, type PageRange } from "./extract/page-range";
import { batch, createSignal } from "solid-js";

// TODO: 余裕があればきれいにする

export function createPdfField() {
  const [file, setFile] = createSignal<File | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  const onFileChange = (file: File | null) => {
    if (!file) {
      batch(() => {
        setError(null);
        setFile(file);
      });
      return;
    }
    if (!isSupportedPdfFile(file)) {
      batch(() => {
        setError("Only PDF files are supported.");
        setFile(null);
      });
      return;
    }
    batch(() => {
      setError(null);
      setFile(file);
    });
  };

  const reset = () => {
    batch(() => {
      setError(null);
      setFile(null);
    });
  };

  return {
    file,
    setFile,
    error,
    onFileChange,
    reset,
  };
}

function parseRangeText(text: string): Result<PageRange[], string> {
  const currentRangeText = text.trim();
  if (currentRangeText === "") {
    return ok([]);
  }
  return parsePageRanges(currentRangeText);
}

function isSupportedPdfFile(file: File): boolean {
  const mime = file.type.trim().toLowerCase();
  if (mime.includes("pdf")) {
    return true;
  }
  if (mime === "") {
    return file.name.trim().toLowerCase().endsWith(".pdf");
  }
  return false;
}

export function createPageRangeField() {
  const [text, setText] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const validateRange = () => {
    const result = parseRangeText(text());
    if (result.isErr()) {
      setError(result.error);
      return null;
    } else {
      setError(null);
      return result.value;
    }
  };

  const reset = () => {
    batch(() => {
      setText("");
      setError(null);
    });
  };

  return {
    text,
    setText,
    error,
    validateRange,
    reset,
  };
}
