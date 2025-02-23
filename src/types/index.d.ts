export interface ServerConfig {
  defaultPort: number;
  maxPortAttempts: number;
  host: string;
}

export interface PortManagerOptions {
  defaultPort?: number;
  maxPortAttempts?: number;
}

export interface PortManager {
  allocatePort(desiredPort?: number): Promise<number | null>;
  releasePort(port: number): void;
  getActivePorts(): number[];
}