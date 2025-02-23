import { EventEmitter } from 'events';
import { findNextAvailablePort } from './portUtils';
import { PortManagerOptions } from '../types';

export class PortManager extends EventEmitter {
  private static instance: PortManager;
  private activePorts: Map<number, boolean>;
  private readonly defaultPort: number;
  private readonly maxPortAttempts: number;

  private constructor(options?: PortManagerOptions) {
    super();
    this.activePorts = new Map();
    this.defaultPort = options?.defaultPort || 3000;
    this.maxPortAttempts = options?.maxPortAttempts || 100;
  }

  public static getInstance(options?: PortManagerOptions): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager(options);
    }
    return PortManager.instance;
  }

  public async allocatePort(desiredPort?: number): Promise<number | null> {
    const startPort = desiredPort || this.defaultPort;
    const port = await findNextAvailablePort(startPort, this.maxPortAttempts);
    
    if (port) {
      this.activePorts.set(port, true);
      this.emit('port-allocated', port);
      return port;
    }
    
    return null;
  }

  public releasePort(port: number): void {
    if (this.activePorts.has(port)) {
      this.activePorts.delete(port);
      this.emit('port-released', port);
    }
  }

  public getActivePorts(): number[] {
    return Array.from(this.activePorts.keys());
  }
}