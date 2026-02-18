import { batch, onCleanup, Show } from "solid-js";
import { createElapsedTimer } from "./create-elapsed-timer";
import { AppLayout } from "./components/AppLayout";
import { ScreenIdle } from "./components/ScreenIdle";
import { ScreenResult } from "./components/ScreenResult";
import { createExtractor } from "./create-extractor";
import { createPageRangeField, createPdfField } from "./user-input";

function App() {
  const extractor = createExtractor();
  const pdfField = createPdfField();
  const rangeField = createPageRangeField();

  const timer = createElapsedTimer();
  const elapsedSec = () => Math.floor(timer.elapsedMs() / 1000);
  onCleanup(() => {
    timer.stop();
  });

  const onExtract = async (event: SubmitEvent) => {
    event.preventDefault();

    extractor.clear();

    const file = pdfField.file();
    if (!file) {
      return;
    }

    const range = rangeField.validateRange();
    if (!range) {
      return;
    }

    timer.start();
    await extractor.run(file, range);
    timer.stop();
  };

  const onReset = () => {
    batch(() => {
      extractor.clear();
      pdfField.reset();
      rangeField.reset();
    });
  };

  return (
    <AppLayout>
      <Show
        when={extractor.status() === "success"}
        fallback={
          <ScreenIdle
            selectedFile={pdfField.file()}
            rangeText={rangeField.text()}
            fileError={pdfField.error()}
            rangeError={rangeField.error()}
            runtimeError={extractor.runtimeError()}
            status={extractor.status()}
            elapsedSec={elapsedSec()}
            onFileChange={pdfField.onFileChange}
            onRangeInput={rangeField.setText}
            onSubmit={onExtract}
          />
        }
      >
        <ScreenResult
          selectedFile={pdfField.file()}
          images={extractor.images()}
          errors={extractor.errors()}
          onReset={onReset}
        />
      </Show>
    </AppLayout>
  );
}

export default App;
