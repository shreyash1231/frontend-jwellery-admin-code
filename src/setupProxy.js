// Dev server only (CRA loads this for `npm start`, never in production builds).
// Forwards /api to the backend so the browser never makes a cross-origin call.
// Set API_PROXY_TARGET (e.g. in .env.development.local) to use a local backend; defaults to live.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.API_PROXY_TARGET || "https://kuchalagindia.com",
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        // The backend's CORS check rejects unknown origins; server-to-server needs none
        proxyReq.removeHeader("origin");
      },
    })
  );
};
