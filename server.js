const WebSocket = require("ws");
const http = require("http");
const https = require("https");

// 🔥 CHANGE THIS TO YOUR REAL RENDER URL
const SELF_URL = "https://lcc-ec.onrender.com";

// 🔥 Your Eagler backend
const TARGET = "ws://144.76.72.157:21515";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Eagler WS Proxy is alive");
});

const wss = new WebSocket.Server({ server });

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

server.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});

// 🔥 AUTO SELF PING (hardcoded URL)
setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log("Self ping:", res.statusCode);
  }).on("error", (err) => {
    console.log("Ping error:", err.message);
  });
}, 5 * 60 * 1000);
