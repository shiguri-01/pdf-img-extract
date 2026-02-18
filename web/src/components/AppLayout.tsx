import type { JSX } from "solid-js";

interface AppLayoutProps {
  children: JSX.Element;
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <main class="min-h-screen px-4 py-8">
      <div class="mx-auto grid w-full max-w-5xl gap-6">
        <header class="grid gap-1">
          <h1 class="text-2xl font-semibold tracking-tight">PDF Image Extractor</h1>
          <p class="text-muted-fg">Drop a PDF and extract raster images.</p>
        </header>
        {props.children}
      </div>
    </main>
  );
}
