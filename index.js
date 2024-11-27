const http = require("http");
const WebSocket = require("ws");
const Stockfish = require('stockfish');

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("HTTP server is working!\n");
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Initialize Stockfish engine
  const engine = Stockfish();

  // Listen for messages from Stockfish and send them to the client
  engine.onmessage = (line) => {
    console.log('Engine says:', line);
    ws.send(line);
  };

  // Listen for messages from the WebSocket client and send them to Stockfish
  ws.on('message', (message) => {
    console.log('Received from client:', message.toString());
    engine.postMessage(message.toString());
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    engine.postMessage('quit'); // Quit the engine
  });

  // Notify client that Stockfish is ready
  ws.send('Stockfish engine loaded');
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log("up and running!");
    console.log(`HTTP server and WebSocket running on port ${PORT}`);
});
