export abstract class Service {
  /**
   * Health check service for scared-ape
   */
  running: boolean;
  constructor() {
    this.running = false;
  }
}
