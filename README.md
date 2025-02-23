# Express Port Switcher

[![npm version](https://badge.fury.io/js/express-port-switcher.svg)](https://www.npmjs.com/package/express-port-switcher)
[![GitHub](https://img.shields.io/github/license/adityamadhab/port-switcher)](https://github.com/adityamadhab/port-switcher/blob/main/LICENSE)

A smart port management tool that automatically tries to bind your Express server to a preferred port (e.g., port 3000), but if that port is already in use, it detects that and forwards incoming requests to an available port instead.

## Features

- 🎯 Try to use preferred port first
- 🔄 Automatic port forwarding if preferred port is busy
- 🚀 Works with Express.js applications
- 📝 TypeScript support out of the box
- 🎣 Callback when port switching occurs

## Installation

```bash
npm install express-port-switcher
```

## Usage

```typescript
import express from "express";
import { PortSwitcher } from "express-port-switcher";

const app = express();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create a new PortSwitcher instance
const portSwitcher = new PortSwitcher({
  preferredPort: 3000, // Default: 3000
  maxAttempts: 100, // Default: 100
  onPortSwitch: (preferredPort, actualPort) => {
    console.log(
      `Port ${preferredPort} was busy, forwarding to port ${actualPort}`
    );
  },
});

// Start the server
portSwitcher
  .listen(app)
  .then((port) => {
    console.log(`Server is running on port ${port}`);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
```

## API Reference

### `PortSwitcher`

#### Constructor Options

```typescript
interface PortSwitcherOptions {
  preferredPort?: number; // The port you'd prefer to use (default: 3000)
  maxAttempts?: number; // Maximum number of ports to try (default: 100)
  onPortSwitch?: (preferredPort: number, actualPort: number) => void; // Callback when port switching occurs
}
```

#### Methods

- `listen(app: Express): Promise<number>`

  - Starts the Express app on the preferred port, or forwards to an available port if occupied
  - Returns a promise that resolves to the actual port number being used

- `getActualPort(): number | null`

  - Returns the actual port the server is running on
  - Returns null if the server hasn't been started

- `close(): Promise<void>`
  - Closes both the proxy and the actual server

### Utility Functions

The package also exports utility functions:

- `isPortAvailable(port: number): Promise<boolean>`

  - Checks if a specific port is available

- `findNextAvailablePort(startPort: number, maxAttempts?: number): Promise<number | null>`
  - Finds the next available port starting from startPort
  - Returns null if no ports are available within maxAttempts

## License

MIT
