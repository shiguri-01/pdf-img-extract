import { Button } from "./ui/button";
interface ExtractActionsProps {
  canSubmit: boolean;
  isRunning: boolean;
}

export function ExtractActions(props: ExtractActionsProps) {
  return (
    <Button
      type="submit"
      class="h-10 min-w-28 px-5 text-sm"
      disabled={!props.canSubmit || props.isRunning}
      aria-busy={props.isRunning}
    >
      {props.isRunning ? "Extracting..." : "Extract"}
    </Button>
  );
}
