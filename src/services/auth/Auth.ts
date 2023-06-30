import c from "config";
import { isNothing } from "../../utils/ez.js";
import { Logger } from "../../utils/Logger.js";
import { init } from "@paralleldrive/cuid2";
import jwt from "jsonwebtoken";

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

  private generateChallengeToken(): string {
    return this.generateId();
  }

  generateAccessToken(email: string): string {
    return jwt.sign(email, this.secret, {
      expiresIn: Auth.sessionLifetime,
    });
  }

  generateRefreshToken(email: string): string {
    return jwt.sign(email, this.secret, {
      expiresIn: Auth.refreshLifetime,
    });
  }

  verify(token: string): boolean {
    try {
      jwt.verify(token, this.secret);
      return true;
    } catch {
      return false;
    }
  }

  static sessionLifetime = "1h";
  static refreshLifetime = "1d";
}
