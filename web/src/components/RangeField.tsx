import { Show } from "solid-js";
import { TextField } from "./ui/text-field";

interface RangeFieldProps {
  value: string;
  disabled?: boolean;
  error: string | null;
  onInput: (value: string) => void;
}

export function RangeField(props: RangeFieldProps) {
  return (
    <TextField.Root
      value={props.value}
      onChange={props.onInput}
      validationState={props.error ? "invalid" : "valid"}
      class="block sm:grid gap-4 grid-cols-[auto_1fr] items-baseline"
    >
      <TextField.Label class="block mb-1 sm:mb-0">Page Range</TextField.Label>
      <div>
        <TextField.Input placeholder="1-3,5" disabled={props.disabled} class="mb-0.5" />
        <TextField.Description>e.g. 1-3,5. Empty means all pages.</TextField.Description>
        <Show when={props.error}>
          {(message) => <TextField.ErrorMessage>{message()}</TextField.ErrorMessage>}
        </Show>
      </div>
    </TextField.Root>
  );
}
