import express from 'express';
import { PortSwitcher } from '../src';

const app = express();

// Add some routes
app.get('/', (req, res) => {
  res.send('Hello from PortSwitcher!');
});

app.get('/info', (req, res) => {
  res.json({
    message: 'This server might be running on a different port than requested',
    time: new Date().toISOString()
  });
});

// Create a PortSwitcher instance
const portSwitcher = new PortSwitcher({
  preferredPort: 3000,
  onPortSwitch: (preferredPort, actualPort) => {
    console.log(`⚡ Port ${preferredPort} was busy, forwarding to port ${actualPort}`);
  }
});

// Start the server
portSwitcher.listen(app)
  .then(port => {
    console.log(`🚀 Server is running!`);
    console.log(`👉 Try: http://localhost:${port}`);
    console.log(`💡 The server will always be accessible on port 3000, even if it's actually running on ${port}`);
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });