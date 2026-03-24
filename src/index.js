import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastProvider } from "./componants/toast/Toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.Fragment>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.Fragment>,
);

reportWebVitals();
