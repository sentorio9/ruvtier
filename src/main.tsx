import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initEditableRuntime } from "./editor/editable";

// Boot the editor runtime BEFORE React mounts so the edit-mode flag is set
// and the click capture handler is in place by the time pages hydrate.
initEditableRuntime();

createRoot(document.getElementById("root")!).render(<App />);
