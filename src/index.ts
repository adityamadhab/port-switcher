import express, { Express } from 'express';
import httpProxy from 'http-proxy';
import { findNextAvailablePort, isPortAvailable } from './lib/portUtils';

export interface PortSwitcherOptions {
  preferredPort?: number;
  maxAttempts?: number;
  onPortSwitch?: (preferredPort: number, actualPort: number) => void;
}

export class PortSwitcher {
  private proxy: httpProxy;
  private actualPort: number | null = null;
  private preferredPort: number;
  private maxAttempts: number;
  private onPortSwitch?: (preferredPort: number, actualPort: number) => void;

  constructor(options: PortSwitcherOptions = {}) {
    this.preferredPort = options.preferredPort || 3000;
    this.maxAttempts = options.maxAttempts || 100;
    this.onPortSwitch = options.onPortSwitch;
    this.proxy = httpProxy.createProxyServer({});
  }

  /**
   * Start the Express app on the preferred port, or forward to an available port if occupied
   * @param app Express application instance
   * @returns Promise resolving to the actual port the server is running on
   */
  async listen(app: Express): Promise<number> {
    // First check if preferred port is available
    const isPreferredPortAvailable = await isPortAvailable(this.preferredPort);

    if (isPreferredPortAvailable) {
      await new Promise<void>((resolve) => {
        app.listen(this.preferredPort, () => {
          this.actualPort = this.preferredPort;
          resolve();
        });
      });
      return this.preferredPort;
    }

    // Find next available port
    const availablePort = await findNextAvailablePort(this.preferredPort + 1, this.maxAttempts);
    if (!availablePort) {
      throw new Error('No available ports found');
    }

    // Start the actual server on the available port
    await new Promise<void>((resolve) => {
      app.listen(availablePort, () => {
        this.actualPort = availablePort;
        resolve();
      });
    });

    // Create proxy server on preferred port
    const proxyApp = express();
    proxyApp.all('*', (req, res) => {
      this.proxy.web(req, res, { target: `http://localhost:${availablePort}` });
    });

    await new Promise<void>((resolve) => {
      proxyApp.listen(this.preferredPort, () => {
        if (this.onPortSwitch) {
          this.onPortSwitch(this.preferredPort, availablePort);
        }
        resolve();
      });
    });

    return availablePort;
  }

  /**
   * Get the actual port the server is running on
   */
  getActualPort(): number | null {
    return this.actualPort;
  }

  /**
   * Close both the proxy and the actual server
   */
  async close(): Promise<void> {
    this.proxy.close();
  }
}

// Export utility functions as well
export { isPortAvailable, findNextAvailablePort } from './lib/portUtils';