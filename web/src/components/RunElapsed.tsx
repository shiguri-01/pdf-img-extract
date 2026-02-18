import type { RunStatus } from "@/extractor-view";
import { Show } from "solid-js";

interface RunElapsedProps {
  status: RunStatus;
  elapsedSec: number;
}

export function RunElapsed(props: RunElapsedProps) {
  const isRunning = () => props.status === "running";

  return (
    <div class="min-h-6 sm:justify-self-end">
      <Show
        when={isRunning()}
        fallback={
          <p class="pt-0.5 text-sm sm:text-right">Processing runs locally in your browser.</p>
        }
      >
        <p
          class="pt-0.5 text-sm tabular-nums text-muted-fg sm:text-right"
          role="status"
          aria-live="polite"
        >
          Elapsed {props.elapsedSec}s
        </p>
      </Show>
    </div>
  );
}
