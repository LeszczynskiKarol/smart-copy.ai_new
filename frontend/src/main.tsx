// frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/google-button.css";
import { loadRecaptcha } from "./lib/recaptcha";

// Load reCAPTCHA script
loadRecaptcha().catch(console.error);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
