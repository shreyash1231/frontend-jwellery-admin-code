import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import "./theme.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastProvider } from "./componants/toast/Toast";

// antd widgets (pagination, selects, date pickers) in the panel's navy instead of default blue
const antdTheme = {
  token: {
    colorPrimary: "#1d2532",
    borderRadius: 8,
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.Fragment>
    <ConfigProvider theme={antdTheme}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ConfigProvider>
  </React.Fragment>,
);

reportWebVitals();
