import { AlertDialog as AlertDialogPrimitive } from "@kobalte/core/alert-dialog";
import { IconX } from "@tabler/icons-solidjs";
import { splitProps, type ComponentProps, type JSX } from "solid-js";
import { cn } from "../../styling";
import { Button } from "./button";

export const AlertDialog = AlertDialogPrimitive;

interface AlertDialogContentProps extends ComponentProps<typeof AlertDialogPrimitive.Content> {
  children: JSX.Element;
}

export function AlertDialogContent(props: AlertDialogContentProps) {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay class="fixed inset-0 z-40 bg-black/45" />
      <div class="fixed inset-0 z-50 grid place-items-center p-4">
        <AlertDialogPrimitive.Content
          class={cn(
            "relative grid w-full max-w-lg gap-4 rounded-xl border bg-bg p-5 shadow-lg",
            local.class,
          )}
          {...rest}
        >
          <AlertDialogPrimitive.CloseButton
            as={Button}
            intent="tertiary"
            type="button"
            class="absolute top-3 right-3 h-9 w-9 p-0"
            aria-label="Close dialog"
          >
            <IconX size={"1em"} />
          </AlertDialogPrimitive.CloseButton>
          {local.children}
        </AlertDialogPrimitive.Content>
      </div>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogTitle(props: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AlertDialogPrimitive.Title class={cn("pr-10 text-lg font-semibold", local.class)} {...rest} />
  );
}

export function AlertDialogDescription(
  props: ComponentProps<typeof AlertDialogPrimitive.Description>,
) {
  return <AlertDialogPrimitive.Description {...props} />;
}
