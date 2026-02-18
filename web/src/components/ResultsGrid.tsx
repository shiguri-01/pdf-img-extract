import { createEffect, createMemo, For, onCleanup } from "solid-js";
import { Button } from "./ui/button";
import type { ExtractedImageItem } from "@/extract";
import { Image } from "@kobalte/core/image";
import { IconDownload } from "@tabler/icons-solidjs";

interface ResultsGridProps {
  images: ExtractedImageItem[];
}

export function ResultsGrid(props: ResultsGridProps) {
  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      <For each={props.images}>{(item, index) => <ImageCard item={item} index={index()} />}</For>
    </div>
  );
}

function ImageCard(props: { item: ExtractedImageItem; index: number }) {
  const fileName = createMemo(
    () => `page-${props.item.pageIndex + 1}-image-${props.index + 1}.png`,
  );
  const pngBytes = createMemo(() => Uint8Array.from(props.item.pngBytes));
  const previewUrl = createMemo(() =>
    URL.createObjectURL(new Blob([pngBytes()], { type: "image/png" })),
  );

  const onDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = previewUrl();
    anchor.download = fileName();
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  createEffect<string | undefined>((previousUrl) => {
    const nextUrl = previewUrl();
    if (previousUrl && previousUrl !== nextUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    return nextUrl;
  });
  onCleanup(() => {
    URL.revokeObjectURL(previewUrl());
  });

  return (
    <div class="grid gap-2 rounded-md bg-muted-bg py-3 px-2">
      <Image class="aspect-4/3 block">
        <Image.Img
          src={previewUrl()}
          alt={`Extracted image: ${fileName()}`}
          class="size-full object-contain"
        />
      </Image>
      <div class="grid grid-cols-[1fr_auto] items-center gap-2 px-1">
        <p class="truncate text-sm" title={fileName()}>
          {fileName()}
        </p>
        <Button intent="secondary" type="button" onClick={onDownload}>
          <IconDownload size={"1em"} class="text-lg" />
        </Button>
      </div>
    </div>
  );
}
