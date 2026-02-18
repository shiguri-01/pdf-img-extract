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
    >
      <TextField.Label>Page Range</TextField.Label>
      <TextField.Description>e.g. 1-3,5. Empty means all pages.</TextField.Description>
      <TextField.Input placeholder="1-3,5" disabled={props.disabled} />
      <Show when={props.error}>
        {(message) => <TextField.ErrorMessage>{message()}</TextField.ErrorMessage>}
      </Show>
    </TextField.Root>
  );
}
