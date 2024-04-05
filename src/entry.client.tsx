import { hydrateRoot } from "react-dom/client";
import { startTransition } from "react";
import App from "@/app/App";

async function entryClient() {
    const container = document.getElementById("root");
    if (container) {
        startTransition(() => {
            hydrateRoot(
                container,
                <App />
            );
        });
    }

    if (import.meta.hot) {
        import.meta.hot.accept();
    }
    // if (import.meta.hot || !container?.innerText) {
    //     const root = createRoot(container!);
    //     root.render(<FullApp />);
    //   } else {
    //     hydrateRoot(container!, <FullApp />);
    //   }
}

entryClient();
