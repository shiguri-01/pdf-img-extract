import { PdfDropzoneField } from "./PdfDropzoneField";

interface IdleInputEmptyProps {
  onFileChange: (file: File | null) => void;
  disabled: boolean;
  fileError: string | null;
}

export function IdleInputEmpty(props: IdleInputEmptyProps) {
  return (
    <div class="grid h-full min-h-88 md:min-h-104">
      <PdfDropzoneField
        onFileChange={props.onFileChange}
        disabled={props.disabled}
        error={props.fileError}
      />
    </div>
  );
}
