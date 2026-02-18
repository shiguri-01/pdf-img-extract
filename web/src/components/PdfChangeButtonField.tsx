import { FileField } from "@kobalte/core/file-field";
import { Show } from "solid-js";
import { buttonStyle } from "./ui/button";
import { cn } from "../styling";

interface PdfChangeButtonFieldProps {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
}

export function PdfChangeButtonField(props: PdfChangeButtonFieldProps) {
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

      <div class="grid gap-2">
        <div
          class={cn(
            "flex flex-wrap items-center justify-end gap-3",
            props.disabled && "opacity-60",
          )}
        >
          <FileField.Trigger class={buttonStyle({ intent: "secondary" })} disabled={props.disabled}>
            Change PDF
          </FileField.Trigger>
        </div>

        <Show when={props.error}>{(message) => <p class="text-error-fg">{message()}</p>}</Show>
      </div>
    </FileField>
  );
}
