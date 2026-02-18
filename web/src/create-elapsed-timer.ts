import { createSignal, onCleanup, type Accessor } from "solid-js";

export function createElapsedTimer(): {
  elapsedMs: Accessor<number>;
  start: () => void;
  stop: () => void;
} {
  const [elapsedMs, setElapsedMs] = createSignal(0);
  let timerId: ReturnType<typeof setInterval> | undefined;

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = undefined;
    }
  };

  const start = () => {
    stop();
    const started = Date.now();
    setElapsedMs(0);
    timerId = setInterval(() => {
      setElapsedMs(Math.max(0, Date.now() - started));
    }, 1000);
  };

  onCleanup(() => {
    stop();
  });

  return { elapsedMs, start, stop };
}
