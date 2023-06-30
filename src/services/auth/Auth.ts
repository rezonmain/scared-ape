import c from "config";
import { isNothing } from "../../utils/ez.js";
import { Logger } from "../../utils/Logger.js";
import { init } from "@paralleldrive/cuid2";
import jwt from "jsonwebtoken";
import type { DB } from "../db/DB.js";
import type { User } from "../../models/User.js";
import { CacheHelper } from "../../utils/CacheHelper.js";
import type { Session } from "../../types/Session.js";

export class Auth {
  private secret: string;
  private generateChallengeId: () => string;
  private generateSessionUserFingerprint: () => string;

  constructor(private db: DB) {
    this.secret = c.get("auth.jwt.secret");
    if (isNothing(this.secret)) {
      Logger.error("Auth: secret is not defined in config file");
      process.exit(1);
    }
    this.generateChallengeId = init({
      length: 16,
    });

    this.generateSessionUserFingerprint = init({
      length: 50,
    });
  }

  generateChallengeToken(): string {
    return this.generateChallengeId();
  }

  verifyJWT({ jwt: _jwt, fgp }: Session): boolean {
    const hashedFingerprint = CacheHelper.hashData(fgp);
    try {
      const decoded = jwt.verify(_jwt, this.secret, { issuer: "ape" });
      if (typeof decoded !== "object") return false;
      if (decoded.fgp !== hashedFingerprint) return false;
      return true;
    } catch {
      return false;
    }
  }

  async verifyChallenge(challengeToken: string): Promise<false | User> {
    let user: User;
    try {
      const challenge = await this.db.getChallenge(challengeToken);
      if (isNothing(challenge)) return false;
      if (new Date(challenge.expiresAt) < new Date()) return false;
      user = await this.db.getUserById(challenge.userId);
      if (isNothing(user)) return false;
      if (!user.whitelist) return false;
    } catch {
      return false;
    }
    return user;
  }

  generateSession(userCuid: User["cuid"]): Session {
    const fgp = this.generateSessionUserFingerprint();
    const hashedFgp = CacheHelper.hashData(fgp);

    const j = jwt.sign(
      {
        cuid: userCuid,
        fgp: hashedFgp,
      },
      this.secret,
      {
        expiresIn: Auth.sessionLifetime,
        issuer: "ape",
      }
    );

    return {
      fgp,
      jwt: j,
    };
  }

  static challengeLifetime = 1 * 60 * 5; // 5 minutes
  static sessionLifetime = "1h";
  static refreshLifetime = "1d";
}
