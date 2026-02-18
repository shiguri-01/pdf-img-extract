import type { ExtractedErrorItem } from "@/extract";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Button } from "./ui/button";

interface ErrorsListProps {
  errors: ExtractedErrorItem[];
}

export function ErrorsList(props: ErrorsListProps) {
  const DEFAULT_VISIBLE_WARNINGS = 6;
  const [expanded, setExpanded] = createSignal(false);

  const visibleErrors = createMemo(() => {
    if (expanded()) {
      return props.errors;
    }
    return props.errors.slice(0, DEFAULT_VISIBLE_WARNINGS);
  });

  const hiddenCount = createMemo(() => Math.max(props.errors.length - visibleErrors().length, 0));

  return (
    <div class="grid gap-2">
      <ul class="grid gap-2">
        <For each={visibleErrors()}>
          {(error) => (
            <li class="rounded-md border border-border bg-muted-bg px-3 py-2">
              <p class="text-error-fg">
                <span class="font-medium">
                  {error.pageIndex !== null ? `Page ${error.pageIndex + 1}` : "Document level"}:
                </span>{" "}
                {error.message}
              </p>
              <p class="text-sm text-muted-fg">{error.kind}</p>
            </li>
          )}
        </For>
      </ul>
      <Show when={hiddenCount() > 0}>
        <div>
          <Button intent="tertiary" type="button" onClick={() => setExpanded((v) => !v)}>
            {expanded() ? "Show fewer warnings" : `Show ${hiddenCount()} more warning(s)`}
          </Button>
        </div>
      </Show>
    </div>
  );
}
