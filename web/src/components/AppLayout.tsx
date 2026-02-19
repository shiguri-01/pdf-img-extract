import type { JSX } from "solid-js";

interface AppLayoutProps {
  children: JSX.Element;
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <main class="min-h-screen px-4 pt-5 sm:pt-8 pb-8">
      <div class="mx-auto grid w-full max-w-5xl gap-6">
        <header class="space-y-1">
          <h1 class="text-4xl">PDF Image Extractor</h1>
          <p class="text-muted-fg leading-tight">Extract raster images from a PDF</p>
        </header>
        {props.children}
      </div>
    </main>
  );
}
