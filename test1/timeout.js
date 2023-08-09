const WebSocket = require('websocket').client;

const client = new WebSocket();

// Connect to your WebSocket server
client.connect('ws://localhost:3001');

client.on('connect', (connection) => {
  console.log('Connected to WebSocket server');

  // Listen for messages (this is optional, just for demonstration)
  connection.on('message', (message) => {
    console.log('Received message:', message.utf8Data);
  });

  // After a delay of 2 minutes, close the connection
  setTimeout(() => {
    console.log('Closing connection');
    connection.close();
  }, 1 * 60 * 1000); // 2 minutes in milliseconds
});

client.on('connectFailed', (error) => {
  console.error('Connection failed:', error);
});