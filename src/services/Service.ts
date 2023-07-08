import type { IServiceDTO } from "./api/dto/service.dto.js";

export abstract class Service {
  /**
   * Health check service for scared-ape
   */
  running: boolean;
  constructor() {
    this.running = false;
  }
  abstract get name(): string;

  get dto(): IServiceDTO {
    return {
      name: this.name,
      running: this.running,
    };
  }
}
