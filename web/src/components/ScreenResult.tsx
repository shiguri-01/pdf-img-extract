import { createMemo, Show } from "solid-js";
import { SelectedPdf } from "./SelectedPdf";
import { Button } from "./ui/button";
import { ResultsGrid } from "./ResultsGrid";
import { ErrorsList } from "./ErrorsList";
import type { ExtractedErrorItem, ExtractedImageItem } from "@/extract";

interface ScreenResultProps {
  selectedFile: File | null;
  images: ExtractedImageItem[];
  errors: ExtractedErrorItem[];
  onReset: () => void;
}

type DisplayWarning = {
  pageIndex: number | null;
  kind: string;
  message: string;
};

function parseImageItem(raw: unknown): ExtractedImageItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<ExtractedImageItem>;
  const { pageIndex, pngBytes } = item;

  if (!Number.isInteger(pageIndex) || Number(pageIndex) < 0) {
    return null;
  }

  if (!(pngBytes instanceof Uint8Array) || pngBytes.byteLength <= 0) {
    return null;
  }

  return { pageIndex: Number(pageIndex), pngBytes };
}

function normalizeWarningItem(raw: unknown): { item: DisplayWarning; repaired: boolean } {
  if (!raw || typeof raw !== "object") {
    return {
      item: {
        pageIndex: null,
        kind: "unknown",
        message: "Invalid warning payload",
      },
      repaired: true,
    };
  }

  const item = raw as Partial<ExtractedErrorItem>;
  const normalizedPageIndex =
    Number.isInteger(item.pageIndex) && Number(item.pageIndex) >= 0 ? Number(item.pageIndex) : null;
  const normalizedKind = typeof item.kind === "string" && item.kind.trim() ? item.kind : "unknown";
  const normalizedMessage =
    typeof item.message === "string" && item.message.trim() ? item.message : "Unknown warning";

  const repaired =
    normalizedPageIndex !== item.pageIndex ||
    normalizedKind !== item.kind ||
    normalizedMessage !== item.message;

  return {
    item: {
      pageIndex: normalizedPageIndex,
      kind: normalizedKind,
      message: normalizedMessage,
    },
    repaired,
  };
}

export function ScreenResult(props: ScreenResultProps) {
  const imageState = createMemo(() => {
    const items: ExtractedImageItem[] = [];
    let droppedCount = 0;

    for (const raw of props.images as unknown[]) {
      const parsed = parseImageItem(raw);
      if (parsed) {
        items.push(parsed);
        continue;
      }
      droppedCount += 1;
    }

    return { items, droppedCount };
  });

  const warningState = createMemo(() => {
    const items: DisplayWarning[] = [];
    let repairedCount = 0;

    for (const raw of props.errors as unknown[]) {
      const normalized = normalizeWarningItem(raw);
      items.push(normalized.item);
      if (normalized.repaired) {
        repairedCount += 1;
      }
    }

    return { items, repairedCount };
  });

  const hasImages = createMemo(() => imageState().items.length > 0);
  const hasWarnings = createMemo(() => warningState().items.length > 0);

  return (
    <section class="grid gap-5 rounded-2xl bg-bg p-5">
      <header class="grid gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <Show when={props.selectedFile}>{(file) => <SelectedPdf file={file()} />}</Show>
          <Button intent="secondary" type="button" onClick={props.onReset}>
            Start Over
          </Button>
        </div>

        <Show when={imageState().droppedCount > 0 || warningState().repairedCount > 0}>
          <p class="text-sm text-muted-fg">
            Skipped {imageState().droppedCount} invalid image item(s) and normalized{" "}
            {warningState().repairedCount} warning item(s).
          </p>
        </Show>
      </header>

      <Show when={hasWarnings()}>
        <section class="grid gap-2">
          <h3 class="font-medium">Warnings</h3>
          <ErrorsList errors={warningState().items} />
        </section>
      </Show>

      <section class="grid gap-3">
        <Show
          when={hasImages()}
          fallback={
            <div class="grid gap-1 py-1">
              <p>No raster images found.</p>
            </div>
          }
        >
          <ResultsGrid images={imageState().items} />
        </Show>
      </section>
    </section>
  );
}
