// TODO: 訳の分からないmode propsを消す

import { PdfChangeButtonField } from "./PdfChangeButtonField";
import { PdfDropzoneField } from "./PdfDropzoneField";

interface PdfFieldProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  mode?: "dropzone" | "compact";
  error?: string | null;
}

export function PdfField(props: PdfFieldProps) {
  const mode = () => props.mode ?? "dropzone";
  if (mode() === "dropzone") {
    return (
      <PdfDropzoneField
        onFileChange={props.onFileChange}
        disabled={props.disabled}
        error={props.error}
      />
    );
  }

  return (
    <PdfChangeButtonField
      onFileChange={props.onFileChange}
      disabled={props.disabled}
      error={props.error}
    />
  );
}
