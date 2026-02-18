import { cva, type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "../../styling";

export const buttonStyle = cva(
  [
    "inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full",
    "font-medium",
    "bg-(--btn-bg) text-(--btn-fg) hover:bg-(--btn-hover) active:bg-(--btn-bg)",
    "border border-(--btn-border)",
    "outline-(--btn-outline) outline-offset-1 focus-visible:outline-2",
    "transition-all",
    "disabled:opacity-50 disabled:hover:bg-(--btn-bg)",
  ],
  {
    variants: {
      intent: {
        primary:
          "[--btn-bg:var(--color-accent-bg)] [--btn-fg:var(--color-accent-fg)] [--btn-border:var(--color-accent-bg)] [--btn-hover:color-mix(in_hsl,var(--color-accent-bg)_96%,var(--color-bg))] [--btn-outline:var(--color-accent-bg)]",
        secondary:
          "[--btn-bg:var(--color-bg)] [--btn-fg:var(--color-fg)] [--btn-border:var(--color-border)] [--btn-hover:var(--color-muted-bg)] [--btn-outline:var(--color-fg)]",
        tertiary:
          "[--btn-bg:var(--color-bg)] [--btn-fg:var(--color-fg)] [--btn-border:transparent] [--btn-hover:var(--color-muted-bg)] [--btn-outline:var(--color-muted-fg)]",
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  },
);

interface ButtonProps
  extends ComponentProps<typeof ButtonPrimitive>, VariantProps<typeof buttonStyle> {}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["class", "intent"]);
  return (
    <ButtonPrimitive class={cn(buttonStyle({ intent: local.intent }), local.class)} {...rest} />
  );
}
