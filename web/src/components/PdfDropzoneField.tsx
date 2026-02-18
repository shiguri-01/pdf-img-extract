import { FileField } from "@kobalte/core/file-field";
import { IconFile } from "@tabler/icons-solidjs";
import { Show } from "solid-js";
import { buttonStyle } from "./ui/button";
import { cn } from "../styling";

interface PdfDropzoneFieldProps {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
}

export function PdfDropzoneField(props: PdfDropzoneFieldProps) {
  return (
    <FileField
      disabled={props.disabled}
      onFileChange={({ acceptedFiles }) => {
        props.onFileChange(acceptedFiles[0] ?? null);
      }}
      accept={"application/pdf"}
      multiple={false}
      allowDragAndDrop
    >
      <FileField.HiddenInput />

      <div class="grid h-full grid-rows-[1fr_auto] gap-2">
        <FileField.Dropzone
          class={cn(
            "grid h-full min-h-[22rem] place-items-center rounded-xl border-2 border-dashed border-border px-4 py-6 md:min-h-[26rem] md:px-6",
            "transition-colors",
            "hover:bg-muted-bg/30",
            props.disabled && "opacity-60",
          )}
        >
          <div class="mx-auto grid w-full max-w-md justify-items-center gap-4 text-center">
            <IconFile class="size-14 text-border md:size-16" aria-hidden="true" />
            <div class="grid gap-1">
              <p class="text-lg font-medium leading-tight">Drop PDF here</p>
              <p class="text-sm text-muted-fg">You can also select a file with Browse.</p>
            </div>
            <FileField.Trigger
              class={cn(buttonStyle({ intent: "secondary" }), "h-10 min-w-28 px-5 text-sm")}
              disabled={props.disabled}
            >
              Browse
            </FileField.Trigger>
          </div>
        </FileField.Dropzone>

        <Show when={props.error}>{(message) => <p class="text-error-fg">{message()}</p>}</Show>
      </div>
    </FileField>
  );
}
