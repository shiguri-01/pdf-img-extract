import { err, ok, Result } from "neverthrow";

export type PageRange = {
  start: number | null;
  end: number | null;
};

const RANGE_PATTERN = /^(\d+)(?:\s*-\s*(\d+))?$/;

export function parsePageRanges(input: string): Result<PageRange[], string> {
  const parts = input
    .split(",")
    .map((part) => part.trim())
    .map(parsePageRange);

  return Result.combine(parts);
}

function parsePageRange(input: string): Result<PageRange, string> {
  const match = input.trim().match(RANGE_PATTERN);
  if (!match) {
    return err(`invalid range text: ${input.trim()}`);
  }

  const RADIX = 10;
  const start = Math.max(parseInt(match[1], RADIX) - 1, 0);
  const end = match[2] != undefined ? Math.max(parseInt(match[2], RADIX) - 1, 0) : start;

  return ok({
    start: Math.min(start, end),
    end: Math.max(start, end),
  });
}
