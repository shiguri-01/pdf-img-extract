import { SelectedPdf } from "./SelectedPdf";
import { RangeField } from "./RangeField";
import { PdfChangeButtonField } from "./PdfChangeButtonField";

interface IdleInputSelectedProps {
  file: File;
  rangeText: string;
  rangeError: string | null;
  fileError: string | null;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onRangeInput: (value: string) => void;
}

export function IdleInputSelected(props: IdleInputSelectedProps) {
  return (
    <div class="grid h-full content-start gap-4 rounded-xl bg-muted-bg p-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <SelectedPdf file={props.file} />
        <PdfChangeButtonField
          onFileChange={props.onFileChange}
          disabled={props.disabled}
          error={props.fileError}
        />
      </div>

      <div class="grid gap-2">
        <RangeField
          value={props.rangeText}
          error={props.rangeError}
          disabled={props.disabled}
          onInput={props.onRangeInput}
        />
      </div>
    </div>
  );
}
