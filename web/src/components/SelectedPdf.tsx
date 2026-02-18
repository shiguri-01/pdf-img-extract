import { createMemo } from "solid-js";

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const value = unitIndex >= 2 ? size.toFixed(1) : Math.floor(size).toString();
  return `${value} ${units[unitIndex]}`;
}

interface SelectedPdfProps {
  file: File;
}

export function SelectedPdf(props: SelectedPdfProps) {
  const name = createMemo(() => props.file.name);
  const size = createMemo(() => formatFileSize(props.file.size));
  return (
    <div class="grid gap-1">
      <p class="truncate text-xl font-medium" title={name()}>
        {name()}
      </p>
      <p class="px-0.5 text-sm text-muted-fg">{size()}</p>
    </div>
  );
}
