// Dev server only (CRA loads this for `npm start`, never in production builds).
// Forwards /api to the live backend so the browser never makes a cross-origin call.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://kuchalagindia.com",
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        // The backend's CORS check rejects unknown origins; server-to-server needs none
        proxyReq.removeHeader("origin");
      },
    })
  );
};
