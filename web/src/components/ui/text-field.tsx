import { TextField as KobalteTextField } from "@kobalte/core/text-field";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "../../styling";

export const textFieldRootStyle = "grid gap-1";
export const textFieldLabelStyle = "font-medium";
export const textFieldDescriptionStyle = "text-muted-fg text-sm";
export const textFieldInputStyle =
  "w-full rounded-md border border-border bg-bg px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-fg disabled:opacity-50";
export const textFieldErrorStyle = "mt-1 text-error-fg";

function Root(props: ComponentProps<typeof KobalteTextField>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <KobalteTextField class={cn(textFieldRootStyle, local.class)} {...rest} />;
}

function Label(props: ComponentProps<typeof KobalteTextField.Label>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <KobalteTextField.Label class={cn(textFieldLabelStyle, local.class)} {...rest} />;
}

function Description(props: ComponentProps<typeof KobalteTextField.Description>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <KobalteTextField.Description class={cn(textFieldDescriptionStyle, local.class)} {...rest} />
  );
}

function Input(props: ComponentProps<typeof KobalteTextField.Input>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <KobalteTextField.Input class={cn(textFieldInputStyle, local.class)} {...rest} />;
}

function ErrorMessage(props: ComponentProps<typeof KobalteTextField.ErrorMessage>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <KobalteTextField.ErrorMessage class={cn(textFieldErrorStyle, local.class)} {...rest} />;
}

export const TextField = Object.assign(Root, {
  Root,
  Label,
  Description,
  Input,
  ErrorMessage,
});
