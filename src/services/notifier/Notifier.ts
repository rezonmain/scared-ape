import type { Peta } from "../Peta.js";
import { Service } from "../Service.js";

export abstract class Notifier extends Service {
  constructor() {
    super();
  }

  abstract sendHealthCheck(peta: Peta): Promise<void>;
}
