const WebSocket = require("ws");
const http = require("http");
const https = require("https");

const TARGET = "ws://144.76.72.157:21515";
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Basic route so Render has something to respond to
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Eagler WS Proxy is alive");
});

const wss = new WebSocket.Server({ server });

// WebSocket forwarder
wss.on("connection", (clientSocket) => {
  const targetSocket = new WebSocket(TARGET);

  targetSocket.on("open", () => {
    clientSocket.on("message", (msg) => {
      if (targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(msg);
      }
    });

    targetSocket.on("message", (msg) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(msg);
      }
    });
  });

  clientSocket.on("close", () => targetSocket.close());
  targetSocket.on("close", () => clientSocket.close());
});

// Start server
server.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});

/* ============================= */
/* 🔥 AUTO SELF PING SECTION 🔥 */
/* ============================= */

const SELF_URL = process.env.RENDER_EXTERNAL_URL;

if (SELF_URL) {
  setInterval(() => {
    https.get(SELF_URL, (res) => {
      console.log("Self ping:", res.statusCode);
    }).on("error", (err) => {
      console.log("Ping error:", err.message);
    });
  }, 5 * 60 * 1000); // every 5 minutes
}
