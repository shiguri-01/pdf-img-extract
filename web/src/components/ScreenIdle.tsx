import { Show } from "solid-js";
import { ExtractActions } from "./ExtractActions";
import { RunElapsed } from "./RunElapsed";
import { RuntimeErrorMessage } from "./RuntimeErrorMessage";
import { IdleInputEmpty } from "./IdleInputEmpty";
import { IdleInputSelected } from "./IdleInputSelected";
import type { RunStatus } from "@/extractor-view";

interface ScreenIdleProps {
  selectedFile: File | null;
  rangeText: string;
  fileError: string | null;
  rangeError: string | null;
  runtimeError: string | null;
  status: RunStatus;
  elapsedSec: number;
  onFileChange: (file: File | null) => void;
  onRangeInput: (value: string) => void;
  onSubmit: (event: SubmitEvent) => void;
}

export function ScreenIdle(props: ScreenIdleProps) {
  const canSubmit = () => props.selectedFile !== null;
  const isRunning = () => props.status === "running";

  return (
    <section class="grid gap-4 rounded-2xl bg-bg p-5">
      <form
        class="grid min-h-[34rem] grid-rows-[1fr_auto] gap-4 md:min-h-[38rem]"
        onSubmit={props.onSubmit}
        noValidate
      >
        <Show
          when={props.selectedFile}
          fallback={
            <IdleInputEmpty
              onFileChange={props.onFileChange}
              disabled={isRunning()}
              fileError={props.fileError}
            />
          }
        >
          {(file) => (
            <div class="grid h-full">
              <IdleInputSelected
                file={file()}
                rangeText={props.rangeText}
                rangeError={props.rangeError}
                fileError={props.fileError}
                disabled={isRunning()}
                onFileChange={props.onFileChange}
                onRangeInput={props.onRangeInput}
              />
            </div>
          )}
        </Show>

        <div class="grid gap-3">
          <div class="grid w-full gap-1 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-3">
            <ExtractActions canSubmit={canSubmit()} isRunning={isRunning()} />
            <RunElapsed status={props.status} elapsedSec={props.elapsedSec} />
          </div>
          <RuntimeErrorMessage status={props.status} runtimeError={props.runtimeError} />
        </div>
      </form>
    </section>
  );
}
