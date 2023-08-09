const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

const activeConnections = new Set();

wss.on("connection", (ws) => {
  activeConnections.add(ws);

  const connectionTimeout = setTimeout(() => {
    ws.close();
    activeConnections.delete(ws);
  }, 1 * 60 * 1000); // 3 minutes in milliseconds

  ws.on("close", () => {
    clearTimeout(connectionTimeout);
    activeConnections.delete(ws);
  });

  ws.on("message", (message) => {
    // Handle WebSocket messages
  });
});

console.log("WebSocket server listening on port 3001");