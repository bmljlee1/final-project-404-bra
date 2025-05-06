import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://3e636a354a27a13f49cfaa516346604e@o4508800272498688.ingest.de.sentry.io/4508800274530384",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>
);
