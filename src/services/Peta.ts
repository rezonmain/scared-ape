import type { Service } from "./Service.js";

/**
 * Health check service for scared-ape
 */
export class Peta {
  readonly services: Service[];
  constructor(...services: Service[]) {
    this.services = services;
  }

  getHealth() {
    return this.services.map((service) => ({
      name: service.name,
      running: service.running,
    }));
  }

  getRuningServices() {
    return this.services.filter((service) => service.running);
  }

  static healthCheckInterval = 1 * 60 * 30; // 30 minutes
}
