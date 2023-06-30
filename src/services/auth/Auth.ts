import c from "config";
import { isNothing } from "../../utils/ez.js";
import { Logger } from "../../utils/Logger.js";
import { init } from "@paralleldrive/cuid2";

export class Auth {
  private secret: string;
  private generateId: () => string;
  constructor() {
    this.secret = c.get("auth.jwt.secret");
    if (isNothing(this.secret)) {
      Logger.error("Auth: secret is not defined in config file");
      process.exit(1);
    }
    this.generateId = init({
      length: 16,
    });
  }

  generateChallengeToken(): string {
    return this.generateId();
  }
}
