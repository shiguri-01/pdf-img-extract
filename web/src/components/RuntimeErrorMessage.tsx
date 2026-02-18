import type { RunStatus } from "@/extractor-view";

interface RuntimeErrorMessageProps {
  status: RunStatus;
  runtimeError: string | null;
}

export function RuntimeErrorMessage(props: RuntimeErrorMessageProps) {
  if (props.status !== "error") {
    return null;
  }

  return (
    <p class="min-h-6 text-muted-fg" role="status" aria-live="polite">
      {props.runtimeError ?? "Extraction failed."}
    </p>
  );
}
