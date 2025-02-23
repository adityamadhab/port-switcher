import express, { Express } from 'express';
import { findNextAvailablePort, isPortAvailable } from './lib/portUtils';

export interface PortSwitcherOptions {
  preferredPort?: number;
  maxAttempts?: number;
  onPortSwitch?: (preferredPort: number, actualPort: number) => void;
}

export class PortSwitcher {
  private actualPort: number | null = null;
  private preferredPort: number;
  private maxAttempts: number;
  private onPortSwitch?: (preferredPort: number, actualPort: number) => void;
  private server: any = null;

  constructor(options: PortSwitcherOptions = {}) {
    this.preferredPort = options.preferredPort || 3000;
    this.maxAttempts = options.maxAttempts || 100;
    this.onPortSwitch = options.onPortSwitch;
  }

  /**
   * Start the Express app on the preferred port, or switch to next available port if occupied
   * @param app Express application instance
   * @returns Promise resolving to the actual port the server is running on
   */
  async listen(app: Express): Promise<number> {
    try {
      // Find an available port starting from the preferred port
      const availablePort = await findNextAvailablePort(this.preferredPort, this.maxAttempts);
      if (!availablePort) {
        throw new Error('No available ports found');
      }

      // Start the server on the available port
      await new Promise<void>((resolve, reject) => {
        this.server = app.listen(availablePort, () => {
          this.actualPort = availablePort;
          if (availablePort !== this.preferredPort && this.onPortSwitch) {
            this.onPortSwitch(this.preferredPort, availablePort);
          }
          resolve();
        });
        this.server.on('error', reject);
      });

      return availablePort;
    } catch (error) {
      // Clean up resources in case of error
      await this.close();
      throw error;
    }
  }

  /**
   * Get the actual port the server is running on
   */
  getActualPort(): number | null {
    return this.actualPort;
  }

  /**
   * Close the server
   */
  async close(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
  }
}

// Export utility functions as well
export { isPortAvailable, findNextAvailablePort } from './lib/portUtils';