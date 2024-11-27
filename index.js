const WebSocket = require('ws');
const Stockfish = require('stockfish');

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server is running on ws://localhost:8080');

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
